import Product from '../../models/product';

export const DELETE_PRODUCT = 'DELETE_PRODUCT';
export const CREATE_PRODUCT = 'CREATE_PRODUCT';
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT';
export const SET_PRODUCTS = 'SET_PRODUCTS';


export const fetchProducts = () => {
  //получаю объект продуктов из бд
  return async dispatch => {
    const response = await fetch('https://react-native-shop-5c767.firebaseio.com/products.json', {
      method: 'GET',
    });
    //парсю
    const resData = await response.json();
    const loadedProducts = [];
    //перевожу объект в массив, с которым уже работает мой фронтенд
    for (const key in resData) {
      loadedProducts.push(new Product(key,
        'u1',
        resData[key].title,
        resData[key].imageUrl,
        resData[key].description,
        resData[key].price))
    }
    //диспатчу массив товаров в стейты
    dispatch({ type: SET_PRODUCTS, products: [] })
  }
}

export const deleteProduct = productId => {
  return { type: DELETE_PRODUCT, pid: productId };
};

export const createProduct = (title, description, imageUrl, price) => {
  return async dispatch => {
    const response = await fetch('https://react-native-shop-5c767.firebaseio.com/products.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, description, imageUrl, price })
    });
    const resData = await response.json();

    console.log(resData)
    dispatch({
      type: CREATE_PRODUCT,
      productData: {
        title,
        description,
        imageUrl,
        price
      }
    });
  };
}
export const updateProduct = (id, title, description, imageUrl) => {
  return dispatch => {

    dispatch({
      type: UPDATE_PRODUCT,
      pid: id,
      productData: {
        title,
        description,
        imageUrl,
      }
    });
  };

};
