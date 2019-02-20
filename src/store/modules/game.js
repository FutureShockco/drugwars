import Vue from 'vue';
import kbyte from '@/helpers/kbyte';
import sc from '@/helpers/steemconnect';

const dealerSteemUsername = process.env.VUE_APP_DEALER_STEEM_USERNAME;

const state = {
  prizeProps: null,
  props: null,
  user: null,
};

const mutations = {
  saveProps(_state, payload) {
    Vue.set(_state, 'props', payload);
  },
  savePrizeProps(_state, payload) {
    Vue.set(_state, 'prizeProps', payload);
  },
  saveUser(_state, payload) {
    Vue.set(_state, 'user', payload);
  },
};

const actions = {
  init: ({ commit, rootState }) =>
    new Promise(resolve => {
      const { username } = rootState.auth;
      Promise.all([
        kbyte.requestAsync('get_props', null),
        kbyte.requestAsync('get_prize_props', null),
        kbyte.requestAsync('get_user', username),
      ]).then(([props, prizeProps, user]) => {
        commit('saveProps', props);
        commit('savePrizeProps', prizeProps);
        commit('saveUser', user);
        resolve();
      });
    }),
  upgradeBuilding: ({ rootState }, { id, level }) =>
    new Promise((resolve, reject) => {
      const payload = {
        username: rootState.auth.username,
        building: id,
        level,
      };
      sc.customEvent(rootState.auth.username, 'dw-upgrade', payload, (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      });
    }),
  recruitUnit: ({ rootState }, { unit, amount }) =>
    new Promise((resolve, reject) => {
      const payload = {
        username: rootState.auth.username,
        unit,
        unit_amount: amount,
      };
      sc.customEvent(rootState.auth.username, 'dw-unit', payload, (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      });
    }),
  investHeist: ({ rootState }, amount) =>
    new Promise((resolve, reject) => {
      const payload = {
        username: rootState.auth.username,
        amount,
      };
      sc.customEvent(rootState.auth.username, 'dw-heist', payload, (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      });
    }),
  requestPayment: ({ rootState }, { memo, amount }) => {
    const { username } = rootState.auth;
    const url = `https://steemconnect.com/sign/transfer?from=${username}&to=${dealerSteemUsername}&amount=${amount} STEEM&memo=${memo}`;
    const win = window.open(url, '_blank');
    win.focus();
  },
};

export default {
  state,
  mutations,
  actions,
};
