const API_KEY = `3285690656af1f203d8f0f6f2cdcea86a2f40b7a4babeec92873d29a87096ed6`

const tickersHandlers = new Map()                                                       // Мап,в котором будут содержаться названия токенов и их методы

const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)  // вэб сокет который мы получаем на сайте

const AGGREGATE_INDEX = '5';                                                            // как оказалось это индекс который можно получить через протокол WS, тоесть если возравщаеться 5, то поход выполнен успешно

                                                                                        // у сокетов есть два основных метода
                                                                                        // событие send - отправить запрос
                                                                                        // событие message - когда приходят сообщения из вэбсокета

socket.addEventListener('message', e => {
    const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice} = JSON.parse(e.data)     //JSON.parse(e.data) - фрагмент кода который преобразует строку JSON, содержащего в свойстве e.data
                                                                                        // в const используеться ДИСТРУКТУРИЗАЦИЯ ОБЪЕКТА!!!! с помощью фигурных скобок
                                                                                        // то что КАПСОМ извлекает значиение этого свойства и потом присваеваеться тому что маленьким текстом написанно
    if(type !== AGGREGATE_INDEX || newPrice === undefined) {                            // если цена равна undefind выходим или если тип полученого значения TYPE из WS не равен 5(успешное выполнение), тоже выходим
        return;
    }   

    const handlers = tickersHandlers.get(currency) ?? [];                               // с помощью get, мы получаем в Map - значение, и просто присваеваем его в handlers, или просто выводим пустой массив
    handlers.forEach(fn => fn(newPrice));                                               // например BTC это currency, с помощью get мы получили его цену, а тут проходим и обновляем цену
}); 


function sendToWebSocket(message) {                                                     // функция которая отправляет сообщения на WS
    const stringifyMessage = JSON.stringify(message)                                    // преобразуем объект message в строку JSON
    if (socket.readyState === WebSocket.OPEN) {                                         // Проверяем состояние WS если он открыт, то отправляем сообщение
        socket.send(stringifyMessage)
        return;
    }
    socket.addEventListener('open', () => {                                             // если WS закрыт, вещаем слушатель события open
        socket.send(stringifyMessage);                                                  // после открытия отправляем сообщение
    }, {once: true})                                                                    // событие сработает только один раз!!!
}

// -------------------РЕАЛИЗАЦИЯ ПОДПИСКИ/ОТПИСКИ----------------------------

function subscribeToTickerOnWS(ticker) {                                                // подписка, тут мы отправляем сообщение на WS, данные взяли с сайта
    sendToWebSocket({                                                                   // ОБЗОР: мы добавляем токен и подписываемся на обновления, которое оно будет получать
        "action": "SubAdd",
        subs: [`5~CCCAGG~${ticker}~USD`]
    })
}

function unsubscribeFromTickerOnWS(ticker) {
    sendToWebSocket({                                                                   // ОБЗОР: на токене есть кнопка удалить, если нажимаем сробатывает функция, 
        "action": "SubRemove",                                                          // и теперь данные про токен не приходят
        subs: [`5~CCCAGG~${ticker}~USD`]
    })
}

export const subscribeToTicker = (ticker, cd) => {
    const subscribers = tickersHandlers.get(ticker) || [];                              // получаю список всех подпищиков, если таких нет, получаем массив (это что бы не было undefined)
    tickersHandlers.set(ticker, [...subscribers, cd])                                   // создаёться новый массив подпищиков с новым подпищиком
    subscribeToTickerOnWS(ticker)
}

export const unsubscribeFromTicker = ticker => {
    tickersHandlers.delete(ticker);
    unsubscribeFromTickerOnWS(ticker);
}

