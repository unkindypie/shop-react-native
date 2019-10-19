import React, { useEffect, useCallback, useReducer, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useSelector, useDispatch } from 'react-redux';

import HeaderButton from '../../components/UI/HeaderButton';
import * as productsActions from '../../store/actions/products';
import Input from '../../components/UI/Input';
import { registerRootComponent } from 'expo';
import Colors from '../../constants/Colors';

//это не redux-reducer. это react-reducer, новая фича, позволяющая объеденять стейты
const formReducer = (state, action) => {
  if (action.type === 'UPDATE') {
    const updatedValues = {
      ...state.inputValues,
      //[string]: value - способ объявления свойства внутри js объекта, если ключ - стркоа
      [action.input]: action.value
    };
    const updatedValidities = {
         ...state.inputValidities,
      [action.input]:
       action.isValid
    }
    let formIsValid = true;
    for (const key in updatedValidities) {
      formIsValid = formIsValid && updatedValidities[key];
    }

    return {
      ...state,
      inputValues: updatedValues,
      inputValidities: updatedValidities,
      formIsValid
    }
  }
  return state;
}

const EditProductScreen = props => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const prodId = props.navigation.getParam('productId');
  const editedProduct = useSelector(state =>
    state.products.userProducts.find(prod => prod.id === prodId)
  );
  const dispatch = useDispatch();

  //useReducre hook - вместо кучи стейтов один объект-стейт, и диспатч + action как в redux, НО ЭТО НЕ REDUX
  //сначала сам редюсер, потом стейт
  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      title: editedProduct ? editedProduct.title : '',
      imageUrl: editedProduct ? editedProduct.imageUrl : '',
      description: editedProduct ? editedProduct.description : '',
      price: ''
    },
    inputValidities: {
      title: !!editedProduct,
      imageUrl: !!editedProduct,
      description: !!editedProduct,
      price: !!editedProduct,
    },
    formValid: !!editedProduct
  }
  )

  useEffect(()=>{
    if(error){
      Alert.alert('Looks like an error', error, [{text: "It's my fault :c"}]);
    }
  }, [error]);

  const submitHandler = useCallback(async () => {
    if (!formState.formIsValid) return Alert.alert('Wrong input!', 'Resubmit with correct fields, you mortal!', [{ text: 'Yes, My Lord' }]);
    setError(false);
    setIsLoading(true);
    try {
      if (editedProduct) {
        await dispatch(
          productsActions.updateProduct(prodId, formState.inputValues.title, formState.inputValues.description, formState.inputValues.imageUrl)
        );
      } else {
        await dispatch(
          productsActions.createProduct(formState.inputValues.title, formState.inputValues.description, formState.inputValues.imageUrl, +formState.inputValues.price)
        );
      }
      props.navigation.goBack();
    } catch (err) {
      setError(err.message);
    }

    setIsLoading(false);
  
  }, [dispatch, prodId, formState]);

  useEffect(() => {
    props.navigation.setParams({ submit: submitHandler });
  }, [submitHandler]);

  //получает значения стейтов инпута и диспатчит их в местные стейты
  const inputChangeHandler = useCallback((inputType, inputValue, isValid) => {
    dispatchFormState({
      type: 'UPDATE',
      value: inputValue,
      isValid,
      input: inputType
    });
  }, [dispatchFormState])

  if(isLoading){
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' color={Colors.primary}/>
      </View>
    )
  }

  return (
    // все эти параметры в KeyboardAvoidingView мастхэв для его работы
    <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding' keyboardVerticalOffset={100}>
      <ScrollView>
        <View style={styles.form}>
          <Input
            id='title'
            keyboardType="default"
            autoCapitalize="sentences"
            autoCorrect
            returnKeyType="next"
            label='Title'
            errorText='Please enter the valid title'
            onInputChange={inputChangeHandler} //когда используешь bind не используй useCallback c этим методом, а то
            //получишь бесконечный цикл, т.к. bind создает новый instanse для этой функции
            initialValue={editedProduct ? editedProduct.title : ''}
            initiallyValid={!!editedProduct}
            required
          />
          <Input
            id='imageUrl'
            label='Image Url'
            errorText="Enter the valid url."
            returnKeyType="next"
            onInputChange={inputChangeHandler}
            initialValue={editedProduct ? editedProduct.imageUrl : ''}
            initiallyValid={!!editedProduct}
            url
            required
          />

          {editedProduct ? undefined : (
            <Input
              id='price'
              keyboardType="decimal-pad"
              returnKeyType="next"
              label="Price"
              errorText="Enter the valid price"
              multiline
              numberOfLines={3}//этот параметр только для андроид
              onInputChange={inputChangeHandler}
              required
              min={0}
            />
          )}
          <Input
            id='description'
            label="Description"
            keyboardType="default"
            errorText="Please enter a valid description"
            onInputChange={inputChangeHandler}
            initialValue={editedProduct ? editedProduct.description : ''}
            initiallyValid={!!editedProduct}
            required
            minLength={5}
          />
        </View>
      </ScrollView >
    </KeyboardAvoidingView>
  );
};

EditProductScreen.navigationOptions = navData => {
  const submitFn = navData.navigation.getParam('submit');
  return {
    headerTitle: navData.navigation.getParam('productId')
      ? 'Edit Product'
      : 'Add Product',
    headerRight: (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Save"
          iconName={
            Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'
          }
          onPress={submitFn}
        />
      </HeaderButtons>
    )
  };
};

const styles = StyleSheet.create({
  form: {
    margin: 20
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center'
  }
});

export default EditProductScreen;
