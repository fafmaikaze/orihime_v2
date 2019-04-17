var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var file = '../test.db';

function initDB(db) {
  return new Promise(function(resolve, reject) {
    db.serialize(function() {
      //每次先都DROP TABLE
      db.run(' DROP TABLE IF EXISTS Torrent_Info ');
      //db.run 如果 Torrent_Info 資料表不存在，那就建立 Torrent_Info 資料表
      db.run(
        ' CREATE TABLE IF NOT EXISTS  Torrent_Info (id INTEGER PRIMARY KEY AUTOINCREMENT, article_title TEXT, article_link TEXT, torrent_link TEXT, post_time TEXT) '
      );
    });
    resolve(db);
  });
}

function readFileToJson(path) {
  var data = fs.readFileSync(path, 'utf8');
  var words = JSON.parse(data);
  return words;
}

function writeFromJson(data, db) {
  return new Promise(function(resolve, reject) {
    //讀檔
    db.serialize(function() {
      var stmt = db.prepare('INSERT INTO Torrent_Info (article_title, article_link, torrent_link, post_time)  VALUES (?,?,?,?)');
      //寫進資料
      for (var i = 0; i < data.length; i++) {
        var temp = [
          data[i].article_title,
          data[i].article_link,
          data[i].torrent_link,
          data[i].post_time
        ];
        stmt.run(temp);
      }
      stmt.finalize();
    });
    resolve(db);
  });
}

function read(db) {
  return new Promise(function(resolve, reject) {
    db.serialize(function() {
      db.each('SELECT * FROM Torrent_Info', function(err, row) {
        // console.log(row);
        if (row !== undefined) {
          console.log(row.id + ': ' + row.post_time + ' = ' + row.article_title);
        }
      });
    });
    resolve(db);
  });
}

function close(db) {
  return new Promise(function(resolve, reject) {
    db.close;
    resolve(db);
  });
}

const promise = function(db) {
  return new Promise((resolve, reject) => {
    resolve(db);
  });
};
const db = new sqlite3.Database(file);

promise().then(() => {
  return initDB(db);
}).then(() => {
  return read(db);
}).then(() => {
  return writeFromJson(readFileToJson('../test.json'), db);;
}).then(() => {
  return read(db);
}).then(() => {
  return close(db);
})