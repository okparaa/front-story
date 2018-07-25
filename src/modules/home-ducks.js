import { keducer as homeReducer, Types }  from '@/utils/keducer';
import { TX, FDT } from '@/utils/tx';
export default homeReducer('home');

export const GET_LOGIN_STATUS = 'home/GET_LOGIN_STATUS';
export const SET_LOGIN_STATUS = 'home/SET_LOGIN_STATUS';

export const LOGIN = Types('home', 'LOGIN');

export const loginPending = () => ({
    type: LOGIN.PENDING,
    payload: {
        processing: true
    }
})
export const loginSuccess = (user) => ({
    type: LOGIN.SUCCESS,
    payload: {
        processing: false,
        user
    }
})
export const loginError = (error) => ({
    type: LOGIN.ERROR,
    payload: {
        processing: false,
        error
    }
})
export const login = (user) => dispatch => {
    dispatch(loginPending());
    return TX.post('/accounts/login', user);
}