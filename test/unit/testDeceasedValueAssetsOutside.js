'use strict';

const initSteps = require('app/core/initSteps');
const expect = require('chai').expect;
const steps = initSteps([`${__dirname}/../../app/steps/action/`, `${__dirname}/../../app/steps/ui`]);
const ValueAssetsOutside = steps.ValueAssetsOutside;

describe('ValueAssetsOutside', () => {
    describe('getUrl()', () => {
        it('should return the correct url', (done) => {
            const url = ValueAssetsOutside.constructor.getUrl();
            expect(url).to.equal('/value-assets-outside-england-wales');
            done();
        });
    });

    describe('handlePost()', () => {
        let ctx;
        let errors;

        it('should return the ctx with the value of the assets outside england and wales', (done) => {
            ctx = {
                netValueAssetsOutsideField: '500000'
            };
            errors = [];
            [ctx, errors] = ValueAssetsOutside.handlePost(ctx, errors);
            expect(ctx).to.deep.equal({
                netValueAssetsOutside: 500000,
                netValueAssetsOutsideField: '500000'
            });
            done();
        });

        it('should return the ctx with the value of the assets outside england and wales (value containing decimals)', (done) => {
            ctx = {
                netValueAssetsOutsideField: '500000.12'
            };
            errors = [];
            [ctx, errors] = ValueAssetsOutside.handlePost(ctx, errors);
            expect(ctx).to.deep.equal({
                netValueAssetsOutside: 500000.12,
                netValueAssetsOutsideField: '500000.12'
            });
            done();
        });

        it('should return the ctx with the value of the assets outside england and wales (value containing 3 decimals and thousands separators)', (done) => {
            ctx = {
                netValueAssetsOutsideField: '500,000.345'
            };
            errors = [];
            [ctx, errors] = ValueAssetsOutside.handlePost(ctx, errors);
            expect(ctx).to.deep.equal({
                netValueAssetsOutside: 500000.35,
                netValueAssetsOutsideField: '500,000.345'
            });
            done();
        });

        it('should return the errors correctly', (done) => {
            ctx = {
                netValueAssetsOutsideField: '50a0000'
            };
            errors = [];
            [ctx, errors] = ValueAssetsOutside.handlePost(ctx, errors);
            expect(ctx).to.deep.equal({
                netValueAssetsOutside: 500000,
                netValueAssetsOutsideField: '50a0000'
            });
            expect(errors).to.deep.equal([
                {
                    msg: {
                        summary: 'You haven&rsquo;t entered a valid amount of assets outside England and Wales',
                        message: 'Enter a valid amount using numbers only'
                    },
                    param: 'netValueAssetsOutsideField'
                }
            ]);
            done();
        });
    });
});
