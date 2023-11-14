/*

Основные проблемы: 
 []   1) Одинаковый код в watch / Критичность: 3
 []   2) При удалении остаёться подписка на загрузку тикера / Критичность: 5
 []   3) Количевство запросов / Критичность: 4
 []   4) запросы напрямую внутри компонента (???) / Критичность: 5
 []   5) Магические строки и числа( URL, 5000 милис задержки, ключ localStorage, количествона странице) / Критичность: 1
 []   6) Обработка ошибок API / Критичность: 5
 []   7) localStorage и анонимные вкладки / Критичность: 3
 []   8) При удалении тикера не изменяеться LocalStorage / Критичность: 4
 []   9) График ужастно выглядит если будет много цен / Критичность: 2
 []   10) Наличии в состояни ЗАВИСИМЫХ ДАННЫХ / Критичность: 5+


 ------------------------------------------------------------------------

 ----------------РЕАЛИЗАЦИЯ ФИЛЬРА-----------------------------

data() {
    page: 1, - текущая страница
    filter: '' - строка фильтра
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

Теперь при выводе всех ticker-ов, мы в v-for передаём не массив tickers, a paginatedList


methods: {
    МЕТОДУ FILTEREDLIST НЕ МЕСТО В МЕТОДАХ
}

computed: {

    startIndex() {
        return (this.page - 1) * 6
    }
    endIndex() {
        return this.page * 6
    }


    filteredList() {                        
        return this.tickers.filter(ticker => ticker.name.includes(this.filter).slice(start, end)             отсортированые тикеры
    },

    paginatedList() {
        return filteredList.slice(this.startIndex, endIndex);
    }

    hasNextPage() {
        return this.filteredList.length > this.endIndex; если длина отсартированого массива тикеров больше длины последней страницы то возвращаем false
    }
}

COMPUTED - НИКОГДА НЕ МОЖЕТ ВЫБИРАТЬ АРГУМЕНТ

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
    pageStateOptions(v) {
        window.history.pushState(null, document.title, `${window.pathname}?filter=${v.filter}&${v.page}`) URL - для страницы
    }
}

computed: {
    pageStateOptions() {
        return {
            filter: this.filter,
            page: this.page
        }
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

		if(this.selectedTicker?.name === tickerName) {
			this.graph.push(data.USD)
		}
	}, 4000)



-------------------------------------------------------------------------------------

------------------------------ЛОГИКА КНОПКИ ДОБАВИТЬ------------------------------------

<div
	v-for="t in filteredList" 
	:key="t.name"
	@click="selectedTicker = t" 
	:class="{'border-4' : selectedTicker === t}"
	class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer">
    <!-- v-for - проходим по массиву tickers, выводим нужное, у каждолго елемента есть свой ключ :key
		при клике на объект сробатывает функц. которая присваивает к selectedTicker елемент t
		если selectedTicker равен t, то мы его выделяем с помощь бордера -->
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
        selectedTicker: ''
    }
}

add() {
    const currentTicker = {
        name: this.ticker,
        price: '-'
    }
    
    this.tickers = [...this.tickers, currentTicker] ОБНОВЛЕНИЕ СПИСКА ТИКЕРОВ (для localStorage)
    this.filter = '',

    this.tickers.push(currentTicker);
}

--РЕАЛИЗАЦИЯ ВЫБОРА--

select(ticker) {
    this.selectedTicker = ticker;
}

watch: {                КОГДА МЕНЯЮТЬСЯ ТИКЕРЫ СОХРАНИ ИХ В ЛОКАЛСТОРАДЖЕ
    tickers() {
        localStorage.setItem('cryptonomicon-list', JSON.stringify(this.tickers));
    }
}

-----------ЛОГИКА УДАЛЕНИЕ ТИКЕРА-------------------

handleDelete(tickerToRemove) {
    this.tickers = this.tickers.filter(t => t != tickerToRemove)
    if(this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null;
    }
}

watch: {
    selectedTicker() {
        this.graph = [];
    }
    paginatedTickers() {                                                   ЕСЛИ МЫ НА СТРАНИЦЕ НИЧЕГО НЕ ВИДЕМ, СБРОСИМ СРАНИЦУ НАЗАД
        if(this.paginatedTickers.length === 0 && this.page > 1) {
            this.page -= 1
        }
    }
}

-----ЛОГИКА НОРМАЛИЗАЦИИ ГРАФИКА------

<div class="flex items-end border-gray-600 border-b border-l h-64">
	<div 
	v-for="(bar, inx) in normalizedGraph" 
	:key="inx" 
	:style = '{ height: `${bar}%`}'
    class="bg-purple-800 border w-10 h-10">
    </div>
</div>


ВЫНОСИМ В COMPUTED

computed: {
    normalizedGraph() {
        const maxValue = Math.max(...this.graph)
        const minValue = Math.min(...this.graph)

        if( MaxValue === minValue) {
            return this.graph.map(() => 50)           //когда ломаеться график. Выводим половину
        }

        return this.graph.map(
            price => 5 +((price - minValue) * 95) / (maxValue - minValue)
        ) 
    }   
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
*/
