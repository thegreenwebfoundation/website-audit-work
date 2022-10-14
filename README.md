# Website Audit Tools

This is a node project created to help with running sets of lighthouse checks against a CSV of urls, of the kind you might generate when looking at the pages tha make up the top 70-80% of traffic for given site.


## Usage

1. First, make sure you have a chromium based browser available on your system.

**On Linux**

On variants of Ubuntu linux, you can run 

```shell 

# update our list of packages we might down load
sudo apt-get update

# install chromium
sudo apt install chromium-browser
```

**On other browsers**

Either install via a GUI as normal, or use your preferred package manager, like homebrew and so on.

2. Install 

```
npm install
```

3. Make sure you have CSV of pages you want to check

|name|current|previous|webarchive|
---|--|--|--|
|Human Readable Name for Page|https://brand-new-hotness.example.com|https://old-and-busted.example.com|https://page-on-webarchive.if-you-cant-access-old-site.com|

Using web archive is not ideal, but if you have no other trace of an old site, and disregard how long a pages takes to load, it can give _some_ idea.




4. Run the checking script.

```
node ./lh-check-urls.js
```


## License

Apache 2.0

