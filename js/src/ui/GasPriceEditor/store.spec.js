// Copyright 2015-2017 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { DEFAULT_GAS, DEFAULT_GASPRICE, MAX_GAS_ESTIMATION } from '~/util/constants';
import { ERRORS } from '~/util/validation';

import GasPriceEditor from './gasPriceEditor';

const { Store } = GasPriceEditor;

const GASPRICE = new BigNumber(123456);
const GASLIMIT = 100000;
const HISTOGRAM = {
  bucketBounds: [1, 2],
  counts: [3, 4]
};

const api = {
  eth: {
    gasPrice: sinon.stub().resolves(GASPRICE)
  },
  parity: {
    gasPriceHistogram: sinon.stub().resolves(HISTOGRAM)
  }
};

describe('ui/GasPriceEditor/store', () => {
  let store = null;

  it('is available via GasPriceEditor.Store', () => {
    expect(new Store(null, {})).to.be.ok;
  });

  describe('constructor (defaults)', () => {
    beforeEach(() => {
      store = new Store(api, { gasLimit: GASLIMIT });
    });

    it('retrieves the histogram and gasPrice', () => {
      expect(api.eth.gasPrice).to.have.been.called;
      expect(api.parity.gasPriceHistogram).to.have.been.called;
    });

    it('sets the gasLimit as passed', () => {
      expect(store.gasLimit).to.equal(GASLIMIT);
    });
  });

  describe('setters', () => {
    beforeEach(() => {
      store = new Store(null, { gasLimit: GASLIMIT });
    });

    describe('setEditing', () => {
      it('sets the value', () => {
        expect(store.isEditing).to.be.false;
        store.setEditing(true);
        expect(store.isEditing).to.be.true;
      });
    });

    describe('setErrorTotal', () => {
      it('sets the value', () => {
        store.setErrorTotal('errorTotal');
        expect(store.errorTotal).to.equal('errorTotal');
      });
    });

    describe('setEstimatedError', () => {
      it('sets the value as provided', () => {
        store.setEstimatedError('errorTest');
        expect(store.errorEstimated).to.equal('errorTest');
      });

      it('sets the null value as provided', () => {
        store.setEstimatedError('errorTest');
        store.setEstimatedError(null);
        expect(store.errorEstimated).to.be.null;
      });

      it('sets a default error when none provided', () => {
        store.setEstimatedError();
        expect(store.errorEstimated).to.equal(ERRORS.gasException);
      });
    });

    describe('setEstimated', () => {
      it('sets the value', () => {
        store.setEstimated('789');
        expect(store.estimated).to.equal('789');
      });

      it('sets error when above exception max', () => {
        store.setEstimated(MAX_GAS_ESTIMATION);
        expect(store.errorEstimated).to.equal(ERRORS.gasException);
      });

      it('sets error when above gaslimit', () => {
        store.setEstimated(GASLIMIT);
        expect(store.errorEstimated).to.equal(ERRORS.gasBlockLimit);
      });
    });

    describe('setEthValue', () => {
      it('sets the value', () => {
        store.setEthValue('123');
        expect(store.weiValue).to.equal('123');
      });
    });

    describe('setGas', () => {
      it('sets the value', () => {
        store.setGas('123');
        expect(store.gas).to.equal('123');
        expect(store.errorGas).to.be.null;
      });

      it('sets error on negative numbers', () => {
        store.setGas(-123);
        expect(store.errorGas).not.to.be.null;
      });

      it('sets error when above block limit', () => {
        store.setGas(GASLIMIT);
        expect(store.errorGas).to.equal(ERRORS.gasBlockLimit);
      });
    });

    describe('setGasLimit', () => {
      it('sets the value', () => {
        store.setGasLimit('123');
        expect(store.gasLimit).to.equal('123');
      });
    });

    describe('setHistogram', () => {
      it('sets the value', () => {
        store.setHistogram(HISTOGRAM);
        expect(store.histogram).to.deep.equal(HISTOGRAM);
      });
    });

    describe('setPrice', () => {
      it('sets the value', () => {
        store.setPrice('123');
        expect(store.price).to.equal('123');
        expect(store.errorPrice).to.be.null;
      });

      it('sets error on negative numbers', () => {
        store.setPrice(-123);
        expect(store.errorPrice).not.to.be.null;
      });
    });
  });

  describe('computed', () => {
    beforeEach(() => {
      store = new Store(null, { gasLimit: GASLIMIT });
    });

    describe('totalValue', () => {
      it('holds the total including eth, price & gas', () => {
        store.setPrice('123');
        store.setGas('123');
        store.setEthValue('123');
        expect(store.totalValue).to.deep.equal(new BigNumber(123 + 123 * 123));
      });
    });
  });

  describe('methods', () => {
    beforeEach(() => {
      store = new Store(null, { gasLimit: GASLIMIT });
    });

    describe('overrideTransaction', () => {
      const TRANSACTION = { gas: '123', gasPrice: '456' };

      it('overrides gas & gasPrice with values', () => {
        store.setGas(DEFAULT_GAS);
        const transaction = store.overrideTransaction(TRANSACTION);

        expect(transaction.gas).to.deep.equal(new BigNumber(DEFAULT_GAS));
        expect(transaction.gasPrice).to.deep.equal(new BigNumber(DEFAULT_GASPRICE));
      });

      it('does not override with invalid gas', () => {
        store.setGas(-123);
        expect(store.overrideTransaction(TRANSACTION)).to.deep.equal(TRANSACTION);
      });

      it('does not override with invalid price', () => {
        store.setPrice(-123);
        expect(store.overrideTransaction(TRANSACTION)).to.deep.equal(TRANSACTION);
      });
    });
  });
});
