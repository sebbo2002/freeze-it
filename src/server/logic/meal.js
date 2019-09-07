'use strict';

const moment = require('moment');
const QRCode = require('qrcode');
const ConfigHelper = require('../helpers/config');

const BaseLogic = require('./_');

class MealLogic extends BaseLogic {
    static getModelName () {
        return 'meal';
    }

    static getPluralModelName () {
        return 'meals';
    }

    static async format (meal) {
        return {
            id: meal.id,
            name: meal.name,
            status: meal.status,
            servings: meal.servings,
            weight: meal.weight,
            category: meal.category,
            calories: meal.calories,
            cookedAt: meal.cookedAt,
            createdAt: meal.createdAt,
            updatedAt: meal.updatedAt
        };
    }

    static getValidStatusValues () {
        return ['available', 'removed', 'eaten'];
    }

    static async create (body) {
        const model = this.getModel().build();
        model.name = body.name || 'Unknown Meal';
        model.servings = parseInt(body.servings, 10) || null;
        model.weight = parseInt(body.weight, 10) || null;
        model.category = body.category || null;
        model.calories = parseInt(body.calories, 10) || null;
        model.cookedAt = body.cookedAt || null;

        await model.save();
        await this.print(model);

        return {model};
    }

    static async update (model) {
        await this.print(model);
        return {model};
    }

    static async list (params) {
        const sql = {
            where: {},
            order: [
                ['createdAt', 'ASC']
            ]
        };

        if (params.status) {
            sql.where.status = params.status;
        }

        return this.getModel().findAll(sql);
    }

    static async print (model) {
        if(!ConfigHelper.isPrintEnabled()) {
            return;
        }

        const fs = require('fs').promises;
        const {join} = require('path');
        const os = require('os');
        const {execFile} = require('child_process');
        const temp = join(os.tmpdir(), 'freeze-it-print-' + new Date().getTime() + '-' + model.id + '.pdf');

        const args = ['-d', ConfigHelper.getPrinterName()];
        if(ConfigHelper.getPrinterHost()) {
            args.push('-h');
            args.push(ConfigHelper.getPrinterHost());
        }
        args.push(temp);

        const pdf = await this.pdf(model);
        await fs.writeFile(temp, pdf);

        try {
            await new Promise((resolve, reject) => {
                execFile('lp', args, (error, stdout, stderr) => {
                    if (error || stderr) {
                        reject(error || stderr);
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        finally {
            await fs.unlink(temp);
        }
    }

    static async pdf (model) {
        const convertHTMLToPDF = require('pdf-puppeteer');
        const html = await this.html(model);
        const options = {
            width: '62mm',
            height: '62mm',
            printBackground: true
        };
        const puppeteerArgs = {
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        };

        return new Promise(resolve => {
            convertHTMLToPDF(html, resolve, options, puppeteerArgs);
        });
    }

    static async html (model) {
        const fields = [];

        // servings
        if(model.servings) {
            fields.push(`<div class="field field--servings">${model.servings}x</div>`);
        }

        // date
        moment.locale('de');
        const date = moment(model.cookedAt || model.createdAt).format('D.MM.YYYY');
        fields.push(`<div class="field field--date">${date}</div>`);

        if(model.weight) {
            fields.push(`<div class="field field--weight">${model.weight}&nbsp;g</div>`);
        }
        if(model.calories) {
            fields.push(`<div class="field field--calories">${model.calories} kcal</div>`);
        }
        if(model.category) {
            fields.push(`<div class="field field--category">${model.category}</div>`);
        }

        // qr code
        const url = ConfigHelper.getPrintURLPrefix() + '/' + model.id.split('-')[0];
        const dataUri = await QRCode.toDataURL(url, {margin: 1});

        return `
            <style>
                body {
                    position: relative;
                    font: 13px 'EB Garamond', 'American Typewriter', 'Vollkorn', 'sans-serif';
                    text-align: center;
                    margin-left: 1.1em;
                }
                .banner {
                    padding: 0.2em;
                    font-size: 0.8em;
                    border-top: 1px solid #000;
                    border-bottom: 1px solid #000;
                    margin-bottom: 0.4em;
                }
                .banner__heart {
                    font: 12px courier;
                }
                .title {
                    padding: 0.2em;
                    font-size: 1.6em;
                    background: #000;
                    color: #fff;
                }
                
                .qr {
                    display: block;
                    margin: 0.6em auto;
                    width: 6em;
                }
                .qr img {
                    width: 100%;
                }
                
                .fields {
                    overflow: hidden;
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    border-style: solid;
                    border-color: #000;
                    border-width: 1px 0 0 1px;
                }
                .field {
                    border-style: solid;
                    border-color: #000;
                    border-width: 0 1px 1px 0;
                    
                    font-size: 0.9em;
                    padding: 0.2em 0.4em;
                    flex: 1 0 auto;
                }
                .field--servings {
                    background: #000;
                    color: #fff;
                }
                
                .footer {
                    position: absolute;
                    bottom: 1em;;
                    left: 1em;
                    right: 1em;
                    font-size: 0.8em;
                }
                .footer:before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: #000;
                    z-index: 5;
                }
                .footer__inner {
                    position: relative;
                    display: block;
                    width: 8em;
                    background: #fff;
                    margin: 0 auto;
                    z-index: 10;
                }
            </style>
            <div class="banner">mit <span class="banner__heart">♡</span> handgemacht</div>
            <div class="title">${model.name}</div>
            <div class="qr"><img src="${dataUri}" /></div>
            <div class="fields">${fields.join('')}</div>
            <div class="footer"><span class="footer__inner">Guten Appetit</span></div>
        `;
    }
}

module.exports = MealLogic;