import Nullstack from 'nullstack';
import './Rispar.scss'
const axios = require('axios');

class Rispar extends Nullstack {
    prepare(context) {
        context.value;
        context.post_ltv
    }
    quotes;
    loan_detail = {
    }
    value = 5000;
    rate;
    tier;
    simulation = [
        {
            "ltv": 50,
            "origination_rate": 2,
            "tier": 3,
            "min": 1000,
            "max": 4999,
            "interest": 1.49,
            "rating": "C3"
        },
        {
            "ltv": 50,
            "origination_rate": 2,
            "tier": 3,
            "min": 1000,
            "max": 4999,
            "interest": 1.49,
            "rating": "C3"
        },
        {
            "ltv": 50,
            "origination_rate": 2,
            "tier": 3,
            "min": 1000,
            "max": 4999,
            "interest": 1.49,
            "rating": "C3"
        }
    ];
    simulation_default = [
        {
            "ltv": 0,
            "origination_rate": 0,
            "tier": 0,
            "min": 0,
            "max": 0,
            "interest": 0,
            "rating": "0"
        },
        {
            "ltv": 0,
            "origination_rate": 0,
            "tier": 0,
            "min": 0,
            "max": 0,
            "interest": 0,
            "rating": "0"
        },
        {
            "ltv": 0,
            "origination_rate": 0,
            "tier": 0,
            "min": 0,
            "max": 0,
            "interest": 0,
            "rating": "0"
        }
    ];

    post_ltv;
    response_post_ltv = '';

    async initiate({ settings }) {
        await axios({
            method: 'get',
            url: 'https://partners.rispar.com.br/v1/rates',
            headers: { "x-api-key": settings.apikey }
        }).then(res => {
            this.quotes = res.data.rates
            this.pricing()
        })
        /*         this.quotes.map(quote => {
                    console.log(quote)
                }) */
    }

    async pricing() {
        let min;
        if (this.value >= 1000 && this.value <= 4999) {
            this.tier = 3
            min = 1000
        }
        if (this.value >= 5000 && this.value <= 19990) {
            this.tier = 2
            min = 5000
        }
        if (this.value >= 20000 && this.value <= 300000) {
            this.tier = 1
            min = 20000
        }
        if (this.value >= 1000 && this.value <= 300000) {
            this.simulation = this.quotes.filter(quote => quote.min == min)
        } else {
            this.simulation = this.simulation_default
        }

    }

    static async postLoan({ settings, amount, ltv }) {
        console.log({ "amount": amount, "ltv": ltv, "external_id": "test" })
        console.log(settings.apikey)
        return await axios({
            method: 'post',
            url: 'https://partners.rispar.com.br/v1/quote',
            headers: {
                "Accept": "*/*",
                "User-Agent": "Mozilla/5.0 (compatible; qatester/1.0.0;)",
                "Content-Type": "application/json;charset=UTF-8", "x-api-key": settings.apikey
            },
            data: { "amount": amount, "ltv": ltv, "external_id": "test" }
        }).then(res => res.data)
    }

    async localpostloan() {
        if (this.value >= 1000 && this.value <= 300000 && this.post_ltv != undefined) {
            document.getElementById("loading").style.visibility = "visible";
            this.loan_detail = await this.postLoan({ amount: this.value, ltv: this.post_ltv })
            document.getElementById("loading").style.visibility = "hidden";
            document.getElementById("detalhes").style.visibility = "visible";
        } else {
            //imprime mensagem de erro
        }   
        console.log(this.loan_detail)
    }
    setLTV(ltv) {
        this.post_ltv = ltv
    }

    render({ value }) {
        return (
            <div class="main">
            <h1>Simular empréstimo</h1>
            <p>Não venda seus bitcoins, obtenha um empréstimo com garantia em bitcoins com a menor taxa de juros do mercado</p>
                <input bind={this.value} onkeyup={this.pricing} data-cy="valor" />
                <form>
                    <div class="ltv">
                        <div class="quote">
                            <p>LTV: 20%</p>
                            <p>Juro: {this.simulation[0].interest}% a.m.</p>
                            <button onclick={{ post_ltv: 20 }}>Selecionar</button>
                        </div>
                        <div class="quote">
                            <p>LTV: 35%</p>
                            <p>Juro: {this.simulation[1].interest}% a.m.</p>
                            <button onclick={{ post_ltv: 35 }}>Selecionar</button>
                        </div>
                        <div class="quote">
                            <p>LTV: 50%</p>
                            <p>Juro: {this.simulation[2].interest}% a.m.</p>
                            <button class="" onclick={{ post_ltv: 50 }}>Selecionar</button>
                        </div>
                    </div>
                    <button onclick={this.localpostloan}>Calcular</button>
                </form>
                <p>{this.value}</p>
                <p>{this.post_ltv}</p>
                <div id="loading" style="visibility: hidden;">
                    <p>Carregando</p>
                </div>
                <div id="detalhes" style="visibility: hidden;">
                    <p>Você recebe R$ {this.loan_detail.net_value}</p>
                    <p>Deixando em garantia {this.loan_detail.collateral / 100000000} BTC</p>
                    <p>Taxa de juros de {this.loan_detail.interest_rate}% a.m</p>
                    <p>Pagando 11 parcelas de R$ {this.loan_detail.installment_value}</p>
                    <p></p>
                    <a href={`https://rispar.com.br/simulador/?utm_source=coinsamba&utm_medium=landing_btn1&utm_campaign=affiliate&amount=${this.loan_detail.net_value}`}target="_parent"><button>Contratar empréstimo</button></a>
                </div>
            </div >
        )
    }
}

export default Rispar;