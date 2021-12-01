import express from 'express';
import { database } from '../config/helpers.js';

const router = express.Router();


/*GET ALL  ORDERS*/
router.get('/', (req, res) => {

    database.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id = o.user_id'
            }
        ])
        .withFields(['o.id', 'p.title', 'p.description', 'p.price', 'u.username'])
        .getAll()
        .then(orders => {
            if (orders.length > 0) {
                res.status(200).json(orders);

            } else {
                res.json({ message: `No orders found.` });
            }
        }).catch(err => res.json(err));


});

/*GET SINGLE ORDERS*/
router.get('/:id', async (req, res) => {

    const orderId = req.params.id

    database.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id = o.user_id'
            }
        ])
        .withFields(['o.id', 'p.title', 'p.description', 'p.price', 'u.username', 'od.quantity as quantityOrdered'])
        .filter({ 'o.id': orderId })
        .getAll()
        .then(orders => {
            if (orders.length > 0) {
                res.status(200).json(orders);

            } else {
                res.json({ message: "No orders found" });
            }
        }).catch(err => res.json(err));

});

/*PLACE A NEW ORDERS*/
router.post('/new', async (req, res) => {

    let { userId, products } = req.body;

    if (userId != null && userId > 0) {

        database.table('orders')
            .insert({
                user_id: userId
            }).then(newOrderId => {

                if (newOrderId > 0) {
                    products.forEach(async (p) => {

                        let data = await database.table('products').filter({ id: p.id }).withFields(['quantity']).get();

                        let incart = parseInt(p.incart);

                        //deduct the numbers of pieces ordered from quantity column in database
                        if (data.quantity > 0) {
                            data.quantity = data.quantity - incart;

                            if (data.quantity < 0) {
                                data.quantity = 0;
                            }

                        } else {
                            data.quantity = 0;
                        }

                        // INSERT ORDER DETAILS W.R.T THE NEWLY GENERATED ORDER ID
                        database.table('orders_details')
                            .insert({
                                order_id: newOrderId,
                                product_id: p.id,
                                quantity: incart
                            }).then(newId => {
                                database.table('products')
                                    .filter({ id: p.id })
                                    .update({
                                        quantity: data.quantity
                                    }).then(successNum => {
                                    }).catch(err => console.log(err));
                            }).catch(err => console.log(err));
                    });
                } else {
                    res.json({ message: 'new order failed while adding new order details', success: false })
                }
                res.json({
                    message: `Order successfully placed with order id ${newOrderId}`,
                    success: true,
                    order_id: newOrderId,
                    products: products
                });

            }).catch(err => res.json(err));
    }
    else {
        res.json({ message: 'New order failed', success: false });
    }
});

/*FAKE PAYEMENT GATEWAY CALL*/
router.post('/payement', (req, res) => {
    setTimeout(() => {
        res.status(200).json({ success: true });
    }, 3000);
});

export default router;