'use strict';
// Node.jsに用意されたモジュールを呼び出す
// fsはFilesystemの略でファイルを扱うためのもの。readlineはファイルを一行ずつ読み込むためのもの
const fs = require('fs');
const readline = require('readline');

// popu-pref.csvからファイル読み込みを行うStreamを生成
// さらにそれをreadlineオブジェクトのinputとして設定、rlオブジェクトを作成
const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({ 'input': rs, 'output': {} });
const prefectureDataMap = new Map(); //key: 都道府県 value: 集計データのオブジェクト

// Node.jsでStreamを扱う際はStreamに対してイベントを監視し、イベントが発生した時に呼び出される関数を設定することによって情報を利用する

// lineというイベントが発生したらこの無名関数(lineString)を呼び出す
// .onメソッドは関数に対してイベント登録できる。第一引数に指定したイベント発生後、第二引数に指定した関数を実行する
rl.on('line', (lineString) => {
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);
    if (year === 2010 || year === 2015) {
        let value = prefectureDataMap.get(prefecture);
        if (!value) {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if (year === 2010) {
        value.popu10 = popu;
        }
        if (year === 2015) {
        value.popu15 = popu;
        }
        prefectureDataMap.set(prefecture, value);
    }
});

rl.on('close', () => {
    for (let [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
    }
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    });
    const rankingStrings = rankingArray.map(([key, value]) => {
        return key + ': ' + value.popu10 + '=>' + value.popu15 + '変化率:' + value.change;
    });
    console.log(rankingStrings);
});