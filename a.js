var und = require('underscore');
var fs = require('fs');
var g_task_list = [];
var g_dmhy_url = 'http://share.dmhy.org';
var g_persistent_time = 600 * 1000; // main thread will wait XXX ms

function call_cb(callback, scope, args) {
	if (typeof(callback) === 'function') {
		callback.apply(scope || window, args);
	}
}

function init_casperjs_instance(task_name) {
	g_task_list[task_name] = require('casper').create({
		pageSettings: {
			loadImages:  false,
			loadPlugins: false,
			webSecurityEnabled: false
		}
	});
	return g_task_list[task_name];
}

function get_main_page(url, callback, scope) {
	var c = init_casperjs_instance()
	var base_url = g_dmhy_url;

	c.start(url, function() {
		var ret = [];

		main_page = this.getElementsInfo('a[href*="topics/view"]');
		und.each(main_page, function(item) {
			ret.push({
				title: item.text.trim(),
				link: base_url + item.attributes.href
			});
		});

		call_cb(callback, scope, [ret]);
		this.wait(g_persistent_time);
	});
	c.run();
}

function torrent_filter(torrents) {
	var keyword_list_raw = fs.read('filter.txt');
	var keyword_list = [];

	function isPassed(name) {
		name = name.toLowerCase();
		var ret = und.find(keyword_list, function(line) {
			var is_NG = und.find(line, function(item) { // find a NG case
				if (name.indexOf(item) === -1) {
					//console.log('NG', name, item);
				}
				return name.indexOf(item) === -1;
			});
			// can't find any NG case => it is passed.
			return is_NG === undefined;
		});
		return ret;
	}
	keyword_list_raw = keyword_list_raw.split('\n');
	und.each(keyword_list_raw, function(item) {
		if (item.length < 5) {
			// Ignoring lines with length < 5  would be a little safer for bad keywords.
			return; 
		}
		keyword_list.push(und.map(item.split(' '), function(item) {
			return item.toLowerCase();
		}));
	});
	console.log(JSON.stringify(keyword_list));
	
	return und.filter(torrents, function(torrent) {
		console.log('test', torrent.title, isPassed(torrent.title));
		return isPassed(torrent.title);
	});

}

function download_torrent(urls, callback, scope) {
	var c = init_casperjs_instance();
	var base_url = g_dmhy_url;

	function link_to_file_name(file_name) {
		var ary = file_name.split('/');
		return ary[ary.length - 1];
	}
	c.start(base_url, function() {
		console.log('test main page done');
	});

	und.each(urls, function(url) {
		console.log(url);
		c.thenOpen(url, function() {
			var torrent_info = this.getElementsInfo('a[href$=torrent]');
			var torrent_link = torrent_info[0].attributes.href;
			var torrent_path = './torrents/' + link_to_file_name(torrent_link);
			var loaded_path = torrent_path + '.loaded';
			
			console.log('D', torrent_link, torrent_path);
			if (fs.exists(torrent_path) || fs.exists(loaded_path)) {
				console.log('torrent exists, skip');
			} else {
				this.download(torrent_link, './torrents/' + link_to_file_name(torrent_link));
			}
		});
	});

	c.run();
}

function main(args) {
	function get_url_list(torrents) {
		return und.map(torrents, function(torrent) {
			return torrent.link;
		});
	}

	get_main_page(args[0] || 'http://share.dmhy.org/topics/list/sort_id/2', function(data) {
		download_list = torrent_filter(data);
		download_torrent(get_url_list(download_list));
	});
}

var casper = init_casperjs_instance()
main(casper.cli.args);
