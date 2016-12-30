# OMG Dashboard

Dashboard I made during my internship at OhMyGeorge.<br>

Featuring
----------
    Trades of all players connected in RealTime
    Graph which show the EUR/USD value
    You can change the Graph time
    Dots on the graph to show the trades of the players
    Number of players connected
    ![Tetris](https://raw.githubusercontent.com/ethanquix/ressources/master/gif/dashboard.gif)
Installation
----------
    git clone https://github.com/ethanquix/omg_dashboard.git
    cd omg_dashboard
    (see Usage section next)
Usage
----------
Edit `./launch.sh`:

```
export RETHINK_URL=''   <---- Set the rethinkdb url, eg: rethinkdb://localhost:28015/database?authKey=somekey 
export MONGO_URL=''     <---- Set the MongoDB url, eg: mongodb://localhost:27017/
export PORT=''          <---- Port on which the app will run
export ROOT_URL=''      <---- Url (or ip) on which the app will run
```

Then just do `./launch.sh`

Dev
----------
    git clone https://github.com/ethanquix/omg_dashboard.git
    cd omg_dashboard

- client contain all the client-side code (display data to the graph)
- server contain all the server-side code (fetch data from db and ticks)
- lib contain the MongoDB collections declarations
- public contain all img, fonts or css

If you want to modify the app, just do a npm install and also <a href="https://www.meteor.com/install">INSTALL METEOR</a><br>
Then you can modify any file, run the `meteor` command and it will detect any change and make an hot reload.

When you want to deploy it, just run `./build.sh`, it will generate an `out` folder with the output in an archive.
Best way to deploy it then is just to run the `launch.sh` script.

:warning: Dont forget to set the ENV variable for the database (see `Usage` section)

> [dimitriwyzlic.com](http://dimitriwyzlic.com) &nbsp;&middot;&nbsp;
> GitHub [@ethanquix](https://github.com/ethanquix) &nbsp;&middot;&nbsp;
> Linkedin [Dimitri Wyzlic](www.linkedin.com/in/dimitriwyzlic)<br>
> Mail: [dimitriwyzlic@gmail.com](mailto:dimitriwyzlic@gmail.com)