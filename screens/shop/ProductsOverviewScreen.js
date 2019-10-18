import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, Button, Platform, View, StyleSheet, Text } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { ActivityIndicator } from 'react-native-paper';

import HeaderButton from '../../components/UI/HeaderButton';
import ProductItem from '../../components/shop/ProductItem';
import * as cartActions from '../../store/actions/cart';
import * as productActions from '../../store/actions/products';
import Colors from '../../constants/Colors';


//ActivityIndicator - анимация загрузки

const ProductsOverviewScreen = props => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const products = useSelector(state => state.products.availableProducts);
  const dispatch = useDispatch();

  const fetchData = useCallback(async ()=>{
    setIsLoading(true);
    try{
      await dispatch(productActions.fetchProducts());
    } catch(e){
      setError(e.message);
      setIsLoading(false);
    }
    setIsLoading(false);
  }, [dispatch, setIsLoading, setError]);

  //при заходе на страницу пытаюсь загрузить данные с сервера снова
  useEffect(()=>{
    //подписываю загрузку товаров на ивент фокуса на этом экране
    const willFocusSub = props.navigation.addListener('willFocus', fetchData);

    //clean-up funсtion, вызывается при разрушении/вызове компонента
    return ()=>{
      willFocusSub.remove();
    }
  }, [fetchData])

  useEffect(() => {
    
    fetchData();

  }, [dispatch, fetchData]);

  const selectItemHandler = (id, title) => {
    props.navigation.navigate('ProductDetail', {
      productId: id,
      productTitle: title
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isLoading && products.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No products found. Start adding something.</Text>
      </View>
    );
  }

  if(error){
    return (
      <View style={styles.centered}>
        <Text>Unable to access to database. Check out your internet connection.</Text>
        <Button title="Retry" onPress={fetchData} color={Colors.primary} style={{width: 50}}/>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={item => item.id}
      renderItem={itemData => (
        <ProductItem
          image={itemData.item.imageUrl}
          title={itemData.item.title}
          price={itemData.item.price}
          onSelect={() => {
            selectItemHandler(itemData.item.id, itemData.item.title);
          }}
        >
          <Button
            color={Colors.primary}
            title="View Details"
            onPress={() => {
              selectItemHandler(itemData.item.id, itemData.item.title);
            }}
          />
          <Button
            color={Colors.primary}
            title="To Cart"
            onPress={() => {
              dispatch(cartActions.addToCart(itemData.item));
            }}
          />
        </ProductItem>
      )}
    />
  );
};

ProductsOverviewScreen.navigationOptions = navData => {
  return {
    headerTitle: 'All Products',
    headerLeft: (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Menu"
          iconName={Platform.OS === 'android' ? 'md-menu' : 'ios-menu'}
          onPress={() => {
            navData.navigation.toggleDrawer();
          }}
        />
      </HeaderButtons>
    ),
    headerRight: (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Cart"
          iconName={Platform.OS === 'android' ? 'md-cart' : 'ios-cart'}
          onPress={() => {
            navData.navigation.navigate('Cart');
          }}
        />
      </HeaderButtons>
    )
  };
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center'
  }
})

export default ProductsOverviewScreen;
