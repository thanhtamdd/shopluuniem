import express from "express";
import httpModule from "http";
import { Server } from "socket.io";
import cors from "cors";
import upload from "express-fileupload";
import bodyParser from "body-parser";
import paypal from "paypal-rest-sdk";

import { connectDB } from "./config/db.js";

import ProductAPI from './API/Router/product.router.js';
import UserAPI from './API/Router/user.router.js';
import OrderAPI from './API/Router/order.router.js';
import Detail_OrderAPI from './API/Router/detail_order.router.js';
import CommentAPI from './API/Router/comment.router.js';
import CategoryAPI from './API/Router/category.router.js';
import NoteAPI from './API/Router/note.router.js';

import ProductAdmin from './API/Router/admin/product.router.js';
import CategoryAdmin from './API/Router/admin/category.router.js';
import Permission from './API/Router/admin/permission.router.js';
import UserAdmin from './API/Router/admin/user.router.js';
import OrderAdmin from './API/Router/admin/order.router.js';
import Coupon from './API/Router/admin/coupon.router.js';
import Sale from './API/Router/admin/sale.router.js';

const app = express();
const http = httpModule.createServer(app);
const io = new Server(http);

const port = process.env.PORT || 8000;

// Kết nối SQL Server
connectDB();

// Middleware
app.use('/', express.static('public'));
app.use(upload());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Cấu hình Paypal
paypal.configure({
  'mode': 'sandbox',
  'client_id': 'YOUR_PAYPAL_CLIENT_ID',
  'client_secret': 'YOUR_PAYPAL_CLIENT_SECRET'
});

// API routes
app.use('/api/Product', ProductAPI);
app.use('/api/User', UserAPI);
app.use('/api/Payment', OrderAPI);
app.use('/api/Comment', CommentAPI);
app.use('/api/Note', NoteAPI);
app.use('/api/DetailOrder', Detail_OrderAPI);
app.use('/api/Category', CategoryAPI);

app.use('/api/admin/Product', ProductAdmin);
app.use('/api/admin/Category', CategoryAdmin);
app.use('/api/admin/Permission', Permission);
app.use('/api/admin/User', UserAdmin);
app.use('/api/admin/Order', OrderAdmin);
app.use('/api/admin/Coupon', Coupon);
app.use('/api/admin/Sale', Sale);

// Socket.io
io.on("connection", (socket) => {
  console.log(`Có người vừa kết nối, socketID: ${socket.id}`);

  socket.on('send_order', (data) => {
    console.log(data)
    socket.broadcast.emit("receive_order", data);
  })
})

http.listen(port, () => {
  console.log('listening on *: ' + port);
});
