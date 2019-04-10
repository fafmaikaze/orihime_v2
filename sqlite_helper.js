var fs = require('fs');
var sqlite3 = require("sqlite3").verbose();

var file = "./test.db";
//new 一個 sqlite 的 database，檔案是 test.db
var db = new sqlite3.Database(file);

db.serialize(function() {
  //db.run 如果 Staff 資料表不存在，那就建立 Staff 資料表
  db.run(
  	"CREATE TABLE IF NOT EXISTS  Torrent_Info (id INTEGER PRIMARY KEY AUTOINCREMENT, torrent_info TEXT, torrent_link TEXT)"
  	);
  var stmt = db.prepare("INSERT INTO Torrent_Info (torrent_info, torrent_link) VALUES (?,?)");
  
  // //寫進10筆資料
  // for (var i = 0; i<10; i++) {
  // 	var temp = ["info"+i,"連接"+i];
  //   stmt.run(temp);
  // }

  stmt.finalize();

  db.each("SELECT * FROM Torrent_Info", function(err, row) {
    //log 出所有的資料
    console.log(row.id + ": " + row.torrent_info + " = " + row.torrent_link);
  });
});

db.close();