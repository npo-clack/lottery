import { candidates } from "./db";
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

type CandidateId = keyof typeof candidates;
const candidatesIds = Object.keys(candidates) as CandidateId[];

type CandidateUser = {
  name: string;
  choiceNum: number;
  winningId: CandidateId | null;
}

type CandidateUserList = Record<CandidateId, CandidateUser[]>;

type CsvData = [string, CandidateId, CandidateId, CandidateId][];

// https://www.delftstack.com/ja/howto/javascript/shuffle-array-javascript/
const fisherYatesShuffle = <T>(arr: T[]): T[] => {
  const copy = [...arr];
  for(var i =copy.length-1 ; i>0 ;i--){
      var j = Math.floor( Math.random() * (i + 1) ); //random index
      [copy[i],copy[j]]=[copy[j],copy[i]]; // swap
  }
  return copy;
}

const importCsv = (): CsvData => {
  const source = path.join(__dirname, 'data.csv');

  // 同期処理
  const data = fs.readFileSync(source);

  const records = parse(data);

  const header = records.shift();

  if(header[0] !== '名前' || header[1] !== '第一希望' || header[2] !== '第二希望' || header[3] !== '第三希望'){
    console.warn('ヘッダーが名前,第一希望,第二希望,第三希望になっていません。');
  };

  console.log('import csv data');
  
  console.log(records);

  return records;
}

/**
 * 候補配列の初期化
 * {
 *   "n-1-1": [],
 *   "n-1-2": [],
 *    ...
 * }
 * @returns 
 */
const initCandidateUserArray = (): CandidateUserList => {
  return (Object.keys(candidates) as CandidateId[]).reduce((accum, currentKey) => {
    accum[currentKey] = [];
    return accum;
  }, {} as CandidateUserList)
}

/**
 * 希望順位順に並べる。希望順位が同列ならば、同列内でシャッフルする。
 * @param users 
 */
const alignAndShuffleUsers = (users: CandidateUser[]) => {

  return [
    ...fisherYatesShuffle(users.filter(user => user.choiceNum === 1)),
    ...fisherYatesShuffle(users.filter(user => user.choiceNum === 2)),
    ...fisherYatesShuffle(users.filter(user => user.choiceNum === 3)),
  ]
}

/**
 * 候補配列に抽選候補者を分配
 * @param users 
 * @returns 
 */
const assignCandidateUserArray = (users:CsvData): CandidateUserList => {
  const candidateUserList = initCandidateUserArray();
  users.forEach(user => {
    const firstList = candidateUserList[user[1]];
    
    if(!firstList) {
      throw new Error(`「${user[1]}」はdb.tsに存在しません! user: ${user[0]}`);
    }
    firstList.push({
      name: user[0],
      choiceNum: 1,
      winningId: null,
    });


    const secondList = candidateUserList[user[2]];

    if(!secondList) {
      throw new Error(`「${user[2]}」はdb.tsに存在しません! user: ${user[0]}`);
    }

    secondList.push({
      name: user[0],
      choiceNum: 2,
      winningId: null,
    });

    const thirdList = candidateUserList[user[3]];
    
    if(!thirdList){
      throw new Error(`「${user[3]}」はdb.tsに存在しません! user: ${user[0]}`);
    }
    
    thirdList.push({
      name: user[0],
      choiceNum: 3,
      winningId: null,
    });
  });
  
  // 整列
  candidatesIds.forEach(candidateId => {
    candidateUserList[candidateId] = alignAndShuffleUsers(candidateUserList[candidateId]);
  })

  return candidateUserList;
}

const doSelection = (list: CandidateUserList, attempt: number, winningList: CandidateUser[], maxUsersNum: number): CandidateUser[] => {
  const index = attempt - 1;

  // 終了条件1
  if(winningList.length >= maxUsersNum) return winningList;
  // 終了条件2
  if(attempt > maxUsersNum) {
    console.error('試行回数がユーザー数を超えました！');
    process.exit(1)
  }

  candidatesIds.forEach(key => {
    // 範囲外判定
    if(list[key].length - 1 < index) return;

    const winningUser = list[key][index];

    // 無効ユーザー判定
    if(winningList.map(winning => winning.name).includes(winningUser.name)) return;
    // 枠数1
    if(winningList.map(winning => winning.winningId).includes(key)) return;

    winningList.push({...winningUser, winningId: key});
  });

  console.log(list)

  return doSelection(list, attempt + 1, winningList, maxUsersNum);
}

const main = () => {
  
  const users = importCsv();

  const maxUsersNum = users.length;

  const lotteryList = assignCandidateUserArray(users);

  const winningList = doSelection(lotteryList, 1, [], maxUsersNum);

  console.log('抽選結果');

  winningList.forEach(user => {
    if(!user.winningId) return;
    console.log(`名前: ${user.name}, 第${user.choiceNum}希望, 発表テーマ: ${candidates[user.winningId]}`);
  })
  
};

main();