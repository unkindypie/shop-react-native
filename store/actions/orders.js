import Order from "../../models/order";

export const ADD_ORDER = 'ADD_ORDER';
export const SET_ORDERS = 'SET_ORDERS';

export const fetchOrders = () => {
  return async dispatch => {
    try {
      const response = await fetch('https://react-native-shop-5c767.firebaseio.com/orders/u1.json', {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Response code is', response.status)
      }

      //парсю
      const resData = await response.json();
      const loadedOrders = [];

      //перевожу объект в массив, с которым уже работает мой фронтенд
      for (const key in resData) {
        loadedOrders.push(new Order(
          key,
          resData[key].cartItems,
          resData[key].totalAmount,
          new Date(resData[key].date)
          ))
      }
      //диспатчу массив товаров в стейты
      dispatch({type: SET_ORDERS, orders: loadedOrders})
    }catch(err){
      throw err;
    }
  }
}

export const addOrder = (cartItems, totalAmount) => {
  return async (dispatch)=>{
    const date = new Date().toISOString();
    const response = await fetch('https://react-native-shop-5c767.firebaseio.com/orders/u1.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
         cartItems,
         totalAmount, 
         date})
    });
    if(!response.ok){
      throw new Error('Servers are down or you are running out of internet.');
    }

    const resData = await response.json();

    dispatch( {
      type: ADD_ORDER,
      orderData: { id: resData.name,items: cartItems, amount: totalAmount, date }
    })
  }
};
