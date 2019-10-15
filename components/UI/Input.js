import React, { useReducer, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import validator from 'validator';

const inputReducer = (state, action) => {
    switch (action.type) {
        case 'INPUT_CHANGE':
            return {
                ...state,
                value: action.value,
                isValid: action.isValid
            }
        case 'INPUT_BLUR':
            return {
                ...state,
                touched: true
            }
        default:
            return state;
    }
};


const Input = props => {

    const [inputState, dispatch] = useReducer(inputReducer, {
        value: props.initialValue ? props.initialValue : '',
        isValid: props.initiallyValid,
        touched: false
    })

    const { onInputChange, id } = props;

    useEffect(() => {
        //отправляю в стейт инпута в перент только если пользователь перестал пользоваться инпутом
        if (inputState.touched) {
            onInputChange(id, inputState.value, inputState.isValid);
        }
    }, [inputState, onInputChange]);

    const lostFocusHandler = () => {
        dispatch({ type: 'INPUT_BLUR' })
    }

    const textChangedHandler = text => {
        let isValid = true;

        if (props.required && text.trim().length === 0) {
            isValid = false;
        }
        if (props.email && !validator.isEmail(text)) {
            isValid = false;
        }
        if (props.min != null && +text < props.min) {
            isValid = false;
        }
        if (props.max != null && +text > props.max) {
            isValid = false;
        }
        if (props.minLength != null && text.length < props.minLength) {
            isValid = false;
        }
        // if(props.url != null && !validator.isURL(text)){
        //     isValid = false;
        // }


        dispatch({ type: 'INPUT_CHANGE', value: text, isValid });
    }

    return (
        <View style={styles.formControl}>
            <Text style={styles.label}>{props.label}</Text>
            <TextInput
                {...props}
                style={styles.input}
                value={inputState.value}
                onChangeText={textChangedHandler}
                onBlur={lostFocusHandler}
                underlineColorAndroid='transparent'
            />
            {!inputState.isValid && inputState.touched && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{props.errorText}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    formControl: {
        width: '100%'
    },
    label: {
        fontFamily: 'open-sans-bold',
        marginVertical: 8
    },
    input: {
        paddingHorizontal: 2,
        paddingVertical: 5,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1
    },
    errorContainer: {
        marginVertical: 5
    },
    errorText: {
        fontFamily: 'open-sans',
        color: 'red',
        fontSize: 13
    }
});

export default Input;