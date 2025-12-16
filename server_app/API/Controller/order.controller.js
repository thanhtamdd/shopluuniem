import mailer from '../../mailer.js';
import crypto from 'crypto';
import { getPool } from '../../config/db.js';

/* =========================
   POST: TẠO ĐƠN HÀNG
========================= */
export const post_order = async (req, res) => {
    try {
        const pool = await getPool();

        const result = await pool.request()
            .input("id_user", req.body.id_user)
            .input("fullname", req.body.fullname)
            .input("phone", req.body.phone)
            .input("address", req.body.address)
            .input("email", req.body.email)
            .input("total", req.body.total)
            .input("price", req.body.price)
            .query(`
                INSERT INTO Orders (id_user, fullname, phone, address, email, total, price)
                OUTPUT INSERTED.*
                VALUES (@id_user, @fullname, @phone, @address, @email, @total, @price)
            `);

        res.json(result.recordset[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* =========================
   GỬI EMAIL HÓA ĐƠN
========================= */
export const send_mail = async (req, res) => {
    try {
        const pool = await getPool();

        const carts = await pool.request()
            .input("id_order", req.body.id_order)
            .query(`
                SELECT d.*, p.name_product, p.price_product, p.image
                FROM Detail_Orders d
                JOIN Products p ON d.id_product = p.id
                WHERE d.id_order = @id_order
            `);

        let htmlHead =
            `<table style="width:50%; border-collapse: collapse">
                <tr>
                    <th>Tên SP</th>
                    <th>Hình</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Size</th>
                    <th>Thành tiền</th>
                </tr>`;

        let htmlContent = "";

        carts.recordset.forEach(item => {
            htmlContent += `
                <tr>
                    <td>${item.name_product}</td>
                    <td><img src="${item.image}" width="80"/></td>
                    <td>${item.price_product}$</td>
                    <td>${item.count}</td>
                    <td>${item.size}</td>
                    <td>${item.price_product * item.count}$</td>
                </tr>`;
        });

        const htmlResult = `
            <h1>Xin chào ${req.body.fullname}</h1>
            <h3>Phone: ${req.body.phone}</h3>
            <h3>Address: ${req.body.address}</h3>
            ${htmlHead + htmlContent}
            </table>
            <h2>Phí vận chuyển: ${req.body.price}$</h2>
            <h1>Tổng thanh toán: ${req.body.total}$</h1>
            <p>Cảm ơn bạn!</p>
        `;

        await mailer.sendMail(req.body.email, 'Hóa Đơn Đặt Hàng', htmlResult);

        res.send("Gửi Email Thành Công");

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* =========================
   GET: ĐƠN HÀNG CỦA USER
========================= */
export const get_order = async (req, res) => {
    try {
        const pool = await getPool();

        const result = await pool.request()
            .input("id_user", req.params.id)
            .query(`
                SELECT * FROM Orders WHERE id_user = @id_user
                ORDER BY created_at DESC
            `);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* =========================
   GET: CHI TIẾT ĐƠN HÀNG
========================= */
export const get_detail = async (req, res) => {
    try {
        const pool = await getPool();

        const order = await pool.request()
            .input("id", req.params.id)
            .query(`
                SELECT * FROM Orders WHERE id = @id
            `);

        res.json(order.recordset[0] || null);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* =========================
   CALLBACK MOMO
========================= */
export const post_momo = async (req, res) => {
    const secretkey = "uLb683H8g9dWuiyipZbLHgO6zjSDlVm5";

    const {
        accessKey, amount, extraData, errorCode, localMessage,
        message, orderId, orderInfo, orderType,
        partnerCode, payType, requestId,
        responseTime, transId, signature
    } = req.body;

    const rawSignature =
        `partnerCode=${partnerCode}&accessKey=${accessKey}&requestId=${requestId}` +
        `&amount=${amount}&orderId=${orderId}&orderInfo=${orderInfo}` +
        `&orderType=${orderType}&transId=${transId}&message=${message}` +
        `&localMessage=${localMessage}&responseTime=${responseTime}` +
        `&errorCode=${errorCode}&payType=${payType}&extraData=${extraData}`;

    const sign = crypto.createHmac('sha256', secretkey)
        .update(rawSignature)
        .digest('hex');

    if (signature !== sign) {
        return res.send("Thông tin request không hợp lệ");
    }

    if (errorCode == 0) {
        res.send("Thanh Cong");
    } else {
        res.send("Thanh toán thất bại");
    }
};
