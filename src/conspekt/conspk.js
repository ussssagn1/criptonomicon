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

------------------------------------------------------------------
cоздаём файл api.js

const API_KEY = `3285690656af1f203d8f0f6f2cdcea86a2f40b7a4babeec92873d29a87096ed6`

-------------------------------------------SINGLE SYMBOL--------------------------------------

export const loadTickers = tickers => 
	fetch(`https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${tickers.join(',')}&api_key=${API_KEY}`)    
		.then(r => r.json()) r - это данные API-шечки
		.then(rawData => Object.fromEntries(                              						Дабы не заморачиваться по поводу получения неправильной цена токена ( 1 / число), 
			Object.entries(rawData).map(([key, value]) => [key, 1 / value])						делаем это автоматически, когда получаем цену с API	
		)               	         

		получаем объект с api
		{a: 1}, {b : 2}
		Object.entries вернёт массив в каждом из которых содержаться 2 массива
		[['a', 1], ['b', 2]] => потом мы берём и преобразовываем его с помощь map такой же массив
		[['a', 1], ['b', 0.5]] и потом с помощью fromEntries приобразуем это обратно в объект a - ключ, 1 - значение 
																							  b - ключ, 0.5 - значение

------------------------------------------MULTIBLE SYMBOL - возвращаеться объект с нормальными ценами----------------------------------------


НЮАНС! Так как api подразумевает что мы будем возвращать цену токена не в одной волюте(USD), а в нескольких
то мы получаем объект запроса, и внутри есть ещё объект с выводом конвертируемой валюты пример:

BTC {
	{
		USD: -----
	},
	{
		UAH: ----
	}
} 

поэтому надо немного переписать код

export const loadTickers = tickers => 
	fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickers.join(',')}&tsyms=USD&api_key=${API_KEY}`)    
		.then(r => r.json()) r - это данные API-шечки
		.then(rawData => Object.fromEntries(                              						Дабы не заморачиваться по поводу получения неправильной цена токена ( 1 / число), 
			Object.entries(rawData).map(([key, value]) => [key, value.USD])						делаем это автоматически, когда получаем цену с API	
		)

----------------------БЕЗНЕС ЛОГИКА - получать ОБНОВЛЕНИЯ стоимости токенов криповалютных пар с API-шки--------------------

вверху мы получаем стоимость, но нам же не это надо, нам нужно обновлять!!!!

const API_KEY = `3285690656af1f203d8f0f6f2cdcea86a2f40b7a4babeec92873d29a87096ed6`

const tickersHandlers = new Map()

const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)  РОБОТА С ВЭБ СОКЕТОМ

const AGGERGATE_INDEX = 5;

socket.addEventListener('message', e => {           //у сокета есть метод send - отправить запрос и событие message когда приходит сообщение в websocket
	const messageContent = JSON.parse(e.data);
	if(messageContent.TYPE !== AGGERGATE_INDEX) {
		return
	}
})

const loadTickers = () => {
	if (tickersHandler.size === 0) {
		return;
	} else {
		fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickersHandler
			.keys()]
			.join(',')}&tsyms=USD&api_key=${API_KEY}`)    
		.then(r => r.json()) r - это данные API-шечки
		.then(rawData => {const updatedPrices = Object.fromEntries(                              						Дабы не заморачиваться по поводу получения неправильной цена токена ( 1 / число), 
			Object.entries(rawData).map(([key, value]) => [key, value.USD])												делаем это автоматически, когда получаем цену с API	

			Object.keys(updatedPrices).forEach([currency, newPrice] => {             текущий токен DOGE например, на неё есть кто подписался
				const handlers =tickersHandlers.get(currency) || [];                 да есть, и неё есть функция которую мы передали в created 
				handlers.forEach(fn => fn(newPrice)); 								 хорошо, вызови ту самую функцию с новой ценой
			})
		})					
	}
}

function subscribeToTickerOnWS(ticker) {
	const message = JSON.stringify({
		"action": "SubAdd"
		subs: [`5~CCCAGG~${ticker}~USD`]
	})

	if(socket.readyState === WebSocket.OPEN) { 
		socket.send(message)
		return
	}
	socket.addEventListener('open', () => {
		socket.send(message);
	}
	{once: true})
}
	
export const subscribeToTicker = (ticker, cb) => {  						когда какой-то тикер обновиться вызови функцию cb
	const subscriber = tickersHandler.get(ticker) || []; 					получает значение пользователя в массиве tickersHandler или пустой массив
	tickersHandler.set(ticker, [...subscribers, cb]) 
	subscribeToTickerOnWS(ticker)
}

export const unsubscribeToTicker = ticker => { 
	tickersHandlers.delete(ticker)
}

setInterval(loadtickersHandler, 5000)



--------------------------------------------------------------------
БИЗНЕС ЛОГИКА

---------------------------

Во App.vue

import { subscribeToTicker, unsubscribeToTicker } from './api.js'


-----METHODS

ПОМЕНЯТЬ ВСЁ ВМЕСТО subscribeToUpdates на updateTickers

formatPrice(price) {
	if(price === '-') {return price;} // в случае ошибки бьем тревогу!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

	return price > 1 ? price.toFixed(2) : price.toPrecision(2);
},

updateTicker(tickerName, price) {
		this.tickers.filter(t => t.name === tickerName).forEach(t => {
			if(t === this.selectedTicker) {
				this.graph.push(price)
			}
			t.price = price 
		})
		
}

handleDelete(tickerToRemove) {
	unsubscribeToTicker(tickerToRemove.name)
}

-------------------------------------------------------------

В HTML

там где токен с данными о цене. пишем:

<div class="px-4 py-5 sm:p-6 text-center">
    <dt class="text-sm font-medium text-gray-500 truncate">
        {{ t.name }} - USD
    </dt>
    <dd class="mt-1 text-3xl font-semibold text-gray-900">
        {{ formatPrice(t.price) }}
    </dd>
</div>

----------------------------------------------------------------------

В created: {
	if(tickersData) {
		this.tickers = JSON.parse(tickersData)

		после БИЗНЕС ИДЕИИ)

		this.tickers.forEach(ticker => {
			subscribeToTicker(ticker.name, (newPrice) => this.updateTicker(ticker.name, newPrice))
		})
	}
	setInterval(this.updateTickers, 5000) // если будет ошибка setInterval(() => this.updateTickers(), 5000)
}


------------------------------------------------------------------------
В add() {
	убираем this.subscribeToUpdates(currentTicker.name)
	
	БЕЗНЕС ЛОГИКА
	this.ticker = ''
	subscribeToTicker(currentTicker.name, newPrice => this.updateTicker(currentTicker.name, newPrice)) // при создании подписки ничего не вызываеться
}










*/