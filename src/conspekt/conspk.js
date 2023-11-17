 /*

----------------РЕАЛИЗАЦИЯ ФИЛЬРА-----------------------------

data() {
    page: 1, - текущая страница
    filter: '' - строка фильтра
    hasNextPage: true;
}
add() {
    this.filter = '' - при добавлении тикера мы сбрасываем filter
}

<div>                                                                            HTML - структура
    <button @click = 'page = page - 1' v-if='page > 1'>Назад</button>            если страница больше 1, то выводим
    <button @click = 'page = page + 1' v-if='hasNextPage'>Вперёд</button>        тут функция
    <div>
        Фильтр
        <input v-model='filter' @input = 'page = 1'/>
    </div>
</div>

Теперь при выводе всех ticker-ов, мы в v-for передаём не массив tickers, a filteredList()


methods: {
    filteredList() {                        
        const start = (this.page - 1) * 6;  КНОПКА СТАРТ
        const end = this.page * 6;      КНОПКА КОНЕЦ            
        
        const filteredTickers = this.tickers.filter(ticker => ticker.name.includes(this.filter).slice(start, end)             отсортированые тикеры

        this.hasNextPage = filteredTickers.length > end               если длина отсартированого массива тикеров больше длины последней страницы то возвращаем false
    },
}

created() {
    const windowData = Object.fromEntries(new URL(window.location).searchParams.entries())
    if (windowData.filter) {
        this.filter = windowData.filter
    }

    if (windowData.page) {
        this.page = windowData.page
    }
    if()
}
watch: {
    filter() {                СЛЕДИ ЗА ПЕРЕМЕННОЙ ФИЛЬТЕР И КОГДА ОНА ИЗМЕНИТЬ МЕНЯЕМ СТРАНИЦУ НА 1
        this.page = 1;
        window.history.pushState(null, document.title, `${window.pathname}?filter=${this.filter}&${this.page}`)  URL - для фильтров
    }
    page() {
        window.history.pushState(null, document.title, `${window.pathname}?filter=${this.filter}&${this.page}`) URL - для страницы
    }
}


WATСH - ПОЗВАЛЯЕТ РЕАГИРОВАТЬ НА ИЗВИНЕНИЕ ПЕРЕМЕННЫХ



----------------------------------------------------------

----------------------МЕТОД ЖИЗНЕНОГО ЦИКЛА CREATED----------------------------------

created() {
    
}

subscribeToUpdates(tickerName) {
	setInterval(async () => {
		const f = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${tickerName}&tsyms=USD&api_key=3285690656af1f203d8f0f6f2cdcea86a2f40b7a4babeec92873d29a87096ed6`)
		// ходим на сервер за данными, нужно вытянуть ту валюту которая указана в скобках, потом апи ключ записать
		const data = await f.json(); // получаем данные в переменную

		this.tickers.find(t => t.name === tickerName).price = data.USD > 1 ? data.USD.toFixed(2) : data.USD.toPrecision(2) // выводим её вместо .price в объекте 

		if(this.sel?.name === tickerName) {
			this.graph.push(data.USD)
		}
	}, 4000)



-------------------------------------------------------------------------------------

------------------------------ЛОГИКА КНОПКИ ДОБАВИТЬ------------------------------------

<div
	v-for="t in tickers" 
	:key="t.name"

	@click="sel = t" 
	:class="{'border-4' : sel === t}"
	class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer">
    <!-- v-for - проходим по массиву tickers, выводим нужное, у каждолго елемента есть свой ключ :key
		при клике на объект сробатывает функц. которая присваивает к sel елемент t
		если sel равен t, то мы его выделяем с помощь бордера -->
	    <div class="px-4 py-5 sm:p-6 text-center">
			<dt class="text-sm font-medium text-gray-500 truncate">
				{{ t.name }} - USD
			</dt>
			<dd class="mt-1 text-3xl font-semibold text-gray-900">
				{{ t.price }} 
			</dd>
		</div>


data() {
    return {
        ticker: '',
        tikcers: [],
        sel: ''
    }
}

add() {
    const currentTicker = {
        name: this.ticker,
        price: '-'
    }

    this.tickers.push(currentTicker);
    this.filter = '',
}

--РЕАЛИЗАЦИЯ ВЫБОРА--

select(ticker) {
    this.sel = ticker;
    this.graph = [];
}

-----------ЛОГИКА УДАЛЕНИЕ ТИКЕРА-------------------

handleDelete(tickerToRemove) {
    this.tickers = this.tickers.filter(t => t != tickerToRemove)
}

-----ЛОГИКА НОРМАЛИЗАЦИИ ГРАФИКА------

<div class="flex items-end border-gray-600 border-b border-l h-64">
	<div 
	v-for="(bar, inx) in normalizeGraph()" 
	:key="inx" 
	:style = '{ height: `${bar}%`}'
    class="bg-purple-800 border w-10 h-10">
    </div>
</div>

normalizeGraph() {
    const maxValue = Math.max(...this.graph)
    const minValue = Math.min(...this.graph)

    return this.graph.map(
        price => 5 +((price - minValue) * 95) / (maxValue - minValue)
    ) 
}

----------------------------------------------------------------------------



--------------------------------------ДОБАВЛЕНИЕ ПОДСКАЗОК INPUT----------------------------------

<span 
	v-for="(coin, indx) in searchHandler.slice(0, 5)"
	:key="indx"
	@click="addBtn(coin.Symbol)"
	class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer">
		{{ coin.Symbol }}
</span>

addBtn(coin) {
	this.ticker = coin
	const currentTicker = { // создаёться новый объект, который пушиться в tickers
		name: this.ticker.toUpperCase(), // имя карточки
		price: '-' // цена карточки
	}
	this.tickers.push(currentTicker)
	this.subscribeToUpdates(currentTicker.name)
				
	this.ticker = ''
},

mounted() { // получаем данные бд
	axios.get('https://min-api.cryptocompare.com/data/all/coinlist?summary=true').then(response => { //response - это данные которые мы получаем
		if(response.data.Data && typeof response.data.Data === 'object') {  если response - объект то this.info устанавливаеться в массив значений свойвст объекта response.data.Data
				this.info = Object.values(response.data.Data); Метод Object.values() возвращает массив, содержащий все значения свойств объекта в том порядке, в котором они перечислены в объекте.
		} else {
			console.error('Данные из API не соответсвуют ожиданиям')
		}
		})
		.catch(error => {
			console.error('Ошибка при получении данных: ', error)
		})
		},
computed: {
	searchHandler() {				
		return this.info.filter(coin => {
			return coin.Symbol.includes(this.ticker.toUpperCase())
	    })
    }
}

-----------------------------------------------------------------











------------------------------------------------------ВТОРАЯ ЧАСТЬ------------------------------------------------------------
в App.vue должна быть реализована бизнес логика, а в других файлах как мы конкретные нюансы бизнес логики реализуем. 
а что у нас не бизнес логика, всё что свзано с API

cоздаём файл api.js

const API_KEY = `3285690656af1f203d8f0f6f2cdcea86a2f40b7a4babeec92873d29a87096ed6`

export const loadTickers = (tickerName) => 
	fetch(`https://min-api.cryptocompare.com/data/price?fsym=USD${tickerName}&tsyms=USD&api_key=${API_KEY}`)    
		.then(r => r.json());          r - это данные API-шечки
`)

Во App.vue

import {loadTickers} from './api.js'

ПОМЕНЯТЬ ВСЁ ВМЕСТО subscribeToUpdates на updateTickers

async updateTickers(tickerName) {
	if(!this.tickers.length) {    
		return;											если у нас пустой массив тикеров, то просто выходим
	}
	const exchangeData = await loadTicker(this.tickers.map(t => t.name))
	this.tickers.map(ticker => {                                               проходим по массиву и у каждого элемента меняем цена на цену еоторая лежит в API
		const price = exchangeData[ticker.name.toUpperCase()];
		ticker.price = price;                                                  замена цены
	})

        this.tickers.find(t => t.name === tickerName).price =
        	exchangeData.USD > 1 ? exchangeData.USD.toFixed(2) : exchangeData.USD.toPrecision(2);

        if (this.selectedTicker?.name === tickerName) {
            this.graph.push(data.USD);
        }
},

В created: {
	if(tickersData) {
		this.tickers = JSON.parse(tickersData)
	}
	setInterval(this.updateTickers, 5000) // если будет ошибка setInterval(() => this.updateTickers(), 5000)
}










*/