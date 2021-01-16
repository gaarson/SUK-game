require('handlebars');
const static = require('koa-static');
const views = require('koa-views');
const path = require('path')

const Koa = require('koa')
const app = new Koa()

app.use(static(path.join(__dirname, '../')));
app.use(static(path.join(__dirname, '../client/static')));
app.use(views(path.join(__dirname, '../client'), { 
  map: { html: 'handlebars' },
  options: {
    helpers: {
      equal: (one, two) => {
        return one && two;
      }
    }
  }
}));

let isGameStarted = false;
let players = [];

app.use(async (ctx) => {
  const isAdmin = ctx.request.query.admin === 'true';

  await ctx.render('index', {
    players: isAdmin 
      ? players 
      : Array.from(players).sort(({ score: a }, { score: b }) => (+a < +b) ? 1 : ((+b < +a) ? -1 : 0)),
    isGameStarted,
    isAdmin,
  });
})

const server = require('http').createServer(app.callback())
const io = require('socket.io')(server)

let clients = 0;

io.on('connection', (socket) => {
  clients++;
  const redraw = () => {
    io.sockets.emit('redraw', { description: clients + ' clients connected!'});
  }

  socket.on('start', (names) => {
    players = names.map((name) => {
      return { name, score: 0 };
    })
    isGameStarted = true;
    redraw();
  })

  socket.on('end', () => {
    isGameStarted = false;
    redraw();
  })

  socket.on('increment', (name) => {
    players = players.map(
      (player) => player.name === name 
      ? { ...player, score: player.score + 1 } 
      : player
    );
    redraw();
  });

  socket.on('decrement', (name) => {
    players = players.map(
      (player) => player.name === name 
      ? { ...player, score: player.score - 1 } 
      : player
    );
    redraw();
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  })
});

server.listen(3000, () => {
    console.log('Application is starting on port 3000')
});
