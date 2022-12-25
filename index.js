const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");
const authRouter = require('./routes/auth.route');
const categoryRouter = require('./routes/category.route');
const menuItemRouter = require('./routes/menuItem.route');
const dashboardRouter = require('./routes/dashboard.route');
const orderRouter = require('./routes/order.route');
const diningTableRouter = require('./routes/diningTable.route');
const zoneRouter = require('./routes/zone.route');
const reservationRouter = require('./routes/reservation.route');
const notificationRouter = require('./routes/notification.route');
const chatRouter = require('./routes/chat.route');

dotenv.config();

mongoose.connect(
    process.env.MONGODB_URL,
    (err) => {
        if (err) console.log(err)
        else console.log("Mongodb is connected");
    }
);

app.use(bodyParser.json({limit: "50mb"}));
app.use(cors());
app.use(morgan("common"));

const http = require('http');
const server = http.createServer(app);

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log("Server is running at http://localhost:" + port);
})

const io = require('./utils/socket.util').init(server);

io.on("connection", (socket) => {
  console.log('User has connected: ' + socket.id);

  socket.on("disconnect", (reason) => {
    console.log('User has disconnected: ' + socket.id)
  });
});

app.get('/', function (req, res) {
    res.send('ok');
})

app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/category', categoryRouter);
app.use('/api/menuItem', menuItemRouter);
app.use('/api/order', orderRouter);
app.use('/api/zone', zoneRouter);
app.use('/api/diningTable', diningTableRouter);
app.use('/api/reservation', reservationRouter);
app.use('/api/notification', notificationRouter);
app.use('/api/chat', chatRouter);
