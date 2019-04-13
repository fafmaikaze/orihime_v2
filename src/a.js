const _ = require('lodash');
const casperjs = require('casper'); // eslint-disable-line import/no-unresolved
const fs = require('fs');

const gTaskList = [];
const gDmhyUrl = 'http://share.dmhy.org';
const gPersistentTime = 600 * 1000; // main thread will wait XXX ms
const jsonOutputFile = 'myjsonfile.json';


function callCb(callback, scope, args) {
  if (typeof (callback) === 'function') {
    callback.apply(scope || undefined, args);
  }
}

function initCasperjsInstance(taskName) {
  gTaskList[taskName] = casperjs.create({
    pageSettings: {
      loadImages: false,
      loadPlugins: false,
      webSecurityEnabled: false,
    },
  });
  return gTaskList[taskName];
}

function getMainPage(url, callback, scope) { // eslint-disable-line no-unused-vars
  const c = initCasperjsInstance();
  const baseUrl = gDmhyUrl;

  c.start(url, () => {
    const ret = [];

    const mainPage = this.getElementsInfo('a[href*="topics/view"]');
    _.each(mainPage, (item) => {
      ret.push({
        title: item.text.trim(),
        link: baseUrl + item.attributes.href,
      });
    });

    callCb(callback, scope, [ret]);
    this.wait(gPersistentTime);
  });
  c.run();
}

function getPages(url, callback, scope) {
  const c = initCasperjsInstance();
  const baseUrl = gDmhyUrl;

  c.start(url, function casperMain() {
    const ret = [];

    // get post article time
    const postTimeHtml = this.getElementsInfo('span[style="display: none;"]');
    // get article title and article link
    const titleHtml = this.getElementsInfo('a[href*="topics/view"]');
    // get torrent path
    const torrentHtml = this.getElementsInfo('a[title="磁力下載"]');
    // console.log(require('utils').dump(main_page));

    for (let i = 0; i < postTimeHtml.length; i++) {
      ret.push({
        post_time: postTimeHtml[i].text.trim(),
        article_title: titleHtml[i].text.trim(),
        article_link: baseUrl + titleHtml[i].attributes.href,
        torrent_link: torrentHtml[i].attributes.href,
      });
    }
    // console.log(require('utils').dump(ret));
    callCb(callback, scope, [ret]);
    this.wait(gPersistentTime);
  });
  c.run();
}

function writeJsonToFile(json) {
  fs.write(jsonOutputFile, json, 'w');
}


function torrentFilter(torrents) {
  let rawKeywordList = fs.read('filter.txt');
  const keywordList = [];

  function isPassed(input) {
    const name = input.toLowerCase();
    const ret = _.find(keywordList, (line) => {
      const isNG = _.find(line, (item) => { // find a NG case
        if (name.indexOf(item) === -1) {
          // console.log('NG', name, item);
        }
        return name.indexOf(item) === -1;
      });
      // can't find any NG case => it is passed.
      return isNG === undefined;
    });
    return ret;
  }
  rawKeywordList = rawKeywordList.split('\n');
  _.each(rawKeywordList, (item) => {
    if (item.length < 5) {
      // Ignoring lines with length < 5  would be a little safer for bad keywords.
      return;
    }
    keywordList.push(_.map(item.split(' '), subItem => subItem.toLowerCase()));
  });
  console.log(JSON.stringify(keywordList));

  return _.filter(torrents, (torrent) => {
    console.log('test', torrent.post_time, ' == ', torrent.article_title);
    // console.log('test', torrent.article_title, isPassed(torrent.article_title));
    return isPassed(torrent.article_title);
  });
}

function downloadTorrent(urls) {
  const c = initCasperjsInstance();
  const baseUrl = gDmhyUrl;

  function linkToFileName(fileName) {
    const ary = fileName.split('/');
    return ary[ary.length - 1];
  }
  c.start(baseUrl, () => {
    console.log('test main page done');
  });

  _.each(urls, (url) => {
    console.log(url);
    c.thenOpen(url, () => {
      const torrentInfo = this.getElementsInfo('a[href$=torrent]');
      const torrentLink = torrentInfo[0].attributes.href;
      const torrentPath = `./torrents/${linkToFileName(torrentLink)}`;
      const loadedPath = `${torrentPath}.loaded`;

      console.log('D', torrentLink, torrentPath);
      if (fs.exists(torrentPath) || fs.exists(loadedPath)) {
        console.log('torrent exists, skip');
      } else {
        this.download(torrentLink, `./torrents/${linkToFileName(torrentLink)}`);
      }
    });
  });

  c.run();
}

function main(args) {
  function getUrlList(torrents) {
    return _.map(torrents, torrent => torrent.link);
  }

  getPages(args[0] || 'http://share.dmhy.org/topics/list/sort_id/2/page1', (data) => {
    writeJsonToFile(JSON.stringify(data));
    const downloadList = torrentFilter(data);
    downloadTorrent(getUrlList(downloadList));
  });
}

const casperInstance = initCasperjsInstance();
main(casperInstance.cli.args);
