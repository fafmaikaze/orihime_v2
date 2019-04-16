var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();

var file = '../test.db';
//new 一個 sqlite 的 database，檔案是 test.db
// var db = new sqlite3.Database(file);

function initDB() {
  return new Promise(function(resolve, reject) {
    var db = new sqlite3.Database(file);
    db.serialize(function() {
      //每次先都DROP TABLE
      db.run(' DROP TABLE IF EXISTS Torrent_Info ');
      //db.run 如果 Torrent_Info 資料表不存在，那就建立 Torrent_Info 資料表
      db.run(
        ' CREATE TABLE IF NOT EXISTS  Torrent_Info (id INTEGER PRIMARY KEY AUTOINCREMENT, article_title TEXT, article_link TEXT, torrent_link TEXT, post_time TEXT) '
      );
    });
    db.close();
  });
}

function readFileToJson(path) {
  return new Promise(function(resolve, reject) {
    var data = fs.readFileSync(path, 'utf8');
    var words = JSON.parse(data);
    console.log('FILE ROW NUMBER: ' + words.length);
    // console.log(words[0].article_title);
  });
}

function writeFromFile(path) {
  return new Promise(function(resolve, reject) {
    //讀檔
    var data = readFileToJson(path);
    var db = new sqlite3.Database(file);
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
    db.close();
  });
}

function read() {
  return new Promise(function(resolve, reject) {
    var db = new sqlite3.Database(file);
    db.serialize(function() {
      db.each('SELECT * FROM Torrent_Info', function(err, row) {
        // console.log(row);
        //log 出所有的資料
        if (row !== undefined) {
          console.log(row.id + ': ' + row.post_time + ' = ' + row.article_title);
        }
      });
    });
    db.close();
    console.log('done read');
  });
}
// readFileToJson('./test.json');
// writeFromFile('./test.json');
const promise = new Promise((resolve, reject) => {
  console.log('LET S GO');
  resolve("WORKS");
  reject("NONO");
});
// var result;
promise
  .then(() => {
    setTimeout(function() {
      initDB();
    }, 1000);

  })
  .then(() => {
    setTimeout(function() {
      console.log('S 1st')
    }, 1000);

  })
  .then(() => {
    setTimeout(function() {
      read()
    }, 1000);
  })
  .then(
    () => {
      setTimeout(function() {
        writeFromFile('../test.json')
      }, 1000);
    }
  )
  .then(() => {
    setTimeout(function() {
      console.log('S 2nd')
    }, 1000);

  })
  .then(
    () => {
      setTimeout(function() {
        read()
      }, 1000);

    }
  );
  
// .then(console.log('E 2nd'))
// .catch(reject => console.log('error:'))

// initDB()
// read()