## banned-in-turkey

A simple application + API for checking if a URL or IP address is blocked in Turkey. It's installed in [bannedinturkey.com](http://bannedinturkey.com).

Check out its API at [bannedinturkey.com/api](http://bannedinturkey.com/api) for using it programmatically.

Example Requests

* [api/youtube.com](http://bannedinturkey.com/api/youtube.com)
* [api/192.156.16.8](http://bannedinturkey.com/api/192.156.16.8)
* [test/192.156.16.8](http://bannedinturkey.com/test/192.156.16.8)
* [test/youtube.com](http://bannedinturkey.com/test/youtube.com)

## Install and Run

```bash
$ git clone https://github.com/azer/banned-in-turkey.git && cd banned-in-turkey
$ npm install
$ DEBUG=* NOCACHE=y npm start
```

![](https://farm4.staticflickr.com/3672/9267087387_1b1413a30d.jpg)
