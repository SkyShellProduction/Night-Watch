//получаем необходимые элементы со страницы
const searchLink = document.querySelector('.search__link .icon-reg'),
    mainContent = document.querySelector('.main__content'),
    mainClose = document.querySelectorAll('.main__close'),
    mainBlock = document.querySelector('.main__block'),
    moviesLink = document.querySelectorAll('.movies__link'),
    movieSolo = document.querySelector('.main__solo'),
    formMain = document.querySelector('.form__main'),
    formInput = formMain.querySelector('input'),
    anime = document.querySelector('.anime'),
    pagination = document.querySelector('.pagination');
//открытие модального окна где можно искать фильмы
function openMainBlock(e) { 
    e.preventDefault();
    mainContent.classList.add('active');
    e.target.closest('body').style.overflow = 'hidden';
}
searchLink.addEventListener('click', openMainBlock);
//закрытие модального окна
moviesLink.forEach(item=>item.addEventListener('click', openMainBlock));
mainClose.forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        mainContent.classList.remove('active');
        e.target.closest('body').style.overflow = '';
    })
});

// window.addEventListener('scroll', function(e){
//     if(this.window.scrollY > 300) nav.classList.add('active');
//     else nav.classList.remove('active');
// })

//открытие бокового меню
let headerBtn = document.querySelector('.header__btn'),
    headerAbs = document.querySelector('.header__abs'),
    headerItems = document.querySelector('.header__items');
headerBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (!this.classList.contains('active')) {
        this.classList.add('active');
        e.target.closest('body').style.overflow = 'hidden';
        headerAbs.classList.add('active');
        headerItems.classList.add('active');
    } else {
        e.target.closest('body').style.overflow = '';
        this.classList.remove('active');
        headerAbs.classList.remove('active');
        headerItems.classList.remove('active');
    }
})
//клик по темной области экрана при открытии бокового меню
headerAbs.addEventListener('click', function (e) {
    e.preventDefault();
    e.target.closest('body').style.overflow = '';
    this.classList.remove('active');
    headerBtn.classList.remove('active');
    headerItems.classList.remove('active');
})
//данные для аутентификации
const host = 'https://kinopoiskapiunofficial.tech';
const hostName = 'X-API-KEY'; //логин для получения данных
const hostValue = 'bc44c90c-0245-4354-aa9c-a6ce5d0a5edd';//пароль для получения данных
//главный класс где хранится вся инфа
class Kino {
    constructor(){
        this.date = new Date().getMonth();
        this.curYear = new Date().getFullYear();
        this.monts = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        this.curMonth = this.monts[this.date];
    }
//подключаемся к базе с фильмами
    fOpen = async (url) => {
        let res = await fetch(url, {
            headers: {
                [hostName]: hostValue,
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
        if (res.ok) return res.json();
        else throw new Error(`Cannot access to ${url}`);
    }
    //получаем топ 250 фильмов
    getTopMovies = (page = 1) => this.fOpen(`${host}/api/v2.2/films/top?type=TOP_250_BEST_FILMS&page=${page}`);
   //получаем инфу по одному фильму
    getSoloFilm = (id) => this.fOpen(`${host}/api/v2.1/films/${id}`);
   //получаем самые ожидаемые фильмы текущего месяца
    getMostAwaited = (page=1, year=this.curYear, month=this.curMonth) => this.fOpen(`${host}/api/v2.1/films/releases?year=${year}&month=${month}&page=${page}`);
   //осуществляем поиск фильмов
    getSearch = (page=1, keyword) => this.fOpen(`${host}/api/v2.1/films/search-by-keyword?keyword=${keyword}&page=${page}`);
   //получаем кадры из фильма
    getFrames = (id) => this.fOpen(`${host}/api/v2.1/films/${id}/frames`);
    //получаем отзывы людей о фильме
    getReviews = (id) => this.fOpen(`${host}/api/v1/reviews?filmId=${id}&page=1`);
}

//для удобства создам экземпляр класса в отдельную переменную
const db = new Kino();
//элемент внутри которого отрендерится карточка в виде слайдера
//какой метод должен при этом сработать
//какая категория должна быть выбрана, исходя из API
//необходимые методы для работы методов класса Kino
//в случае необходимости добавить класс нужной карточке
async function renderTrendMovies(element = [], fn = [], films =[], params=[]) {
    anime.classList.add('active');
    element.forEach((item, i) => {
        let parent = document.querySelector(`${item} .swiper-wrapper`);
        db[fn[i]](params[i]).then(data => {
            data[films[i]].forEach(elem => {
                let slide = document.createElement('div');
                slide.classList.add("swiper-slide");
                slide.innerHTML = `
                    <div class="movie__item" data-id="${elem.filmId}">
                        <img src="${elem.posterUrlPreview}" alt="${elem.nameRu} ${elem.nameEn}" loading="lazy">
                    </div>
                `;
                parent.append(slide);
            });
        })
        .then(() => {
            element.forEach(item => {
                new Swiper(`${item}`, {
                    slidesPerView: 1,
                    spaceBetween: 27,
                    // slidesPerGroup: 3,
                    loop: true,
                    // loopFillGroupWithBlank: true,
                    navigation: {
                        nextEl: `${element} .swiper-button-next`,
                        prevEl: `${element} .swiper-button-prev`,
                    },
                    breakpoints: {
                        1440: {
                            slidesPerView: 6,
                        },
                        1200: {
                            slidesPerView: 5,
                        },
                        960: {
                            slidesPerView: 4,
                        },
                        720: {
                            slidesPerView: 3,
                        },
                        500: {
                            slidesPerView: 2,
                        },
                    }
                });
            });
            db.getTopMovies().then(data=>{
                let rand = Math.floor(Math.random() * data.pagesCount + 1);
                renderHeader(rand);
            });
            let m = document.querySelectorAll('.movie__item');
            m.forEach(item=>item.addEventListener('click', function(e){
                let attr = this.getAttribute('data-id');
                openMainBlock(e);
                renderSolo(attr);
            }));
        })
        .catch(e=>{
            console.log(e);
            anime.classList.remove('active');
        })
    })
}
//рендер карточки топовых фильмов
renderTrendMovies(['.trend__tv-slider', '.popular__actors-slider'] , ['getTopMovies', 'getMostAwaited'], ['films', 'releases'], [1,1]);

//рендерим название текущего месяца
const popularActorsTitle = document.querySelector('.popular__actors-title strong'),
    year = document.querySelector('.year');
popularActorsTitle.textContent = `${db.curMonth} ${db.curYear}`;
year.textContent = db.curYear;

let comingSoonImg = document.querySelector('.coming__soon-block>img');
let randImg = db.getMostAwaited(2).then(data=>{
    let random = Math.floor(Math.random() * data.releases.length);
    comingSoonImg.src = data.releases[random].posterUrl;
    // console.log(data.releases[random]);
})

//рендер хедера
//функция рендера хедера
function renderHeader(page){
    db.getTopMovies(page).then(data=>{
        anime.classList.add('active');
        let max =  Math.floor(Math.random() * data.films.length);
        let filmId = data.films[max].filmId;
        let filmRating = data.films[max].rating;
        db.getSoloFilm(filmId).then(response=>{
            let sm = response.data;
            let headerText = document.querySelector('.header__text');
            headerText.innerHTML = `
                <h1 class="header__title">${sm.nameRu !== '' ? sm.nameRu : sm.nameEn}</h1>
                <div class="header__balls">
                    <span class="header__year">${sm.year}</span>
                    <span class="logo__span header__rating  header__year ">${sm.ratingAgeLimits}+</span>
                    <div class="header__seasons header__year">${sm.seasons.length}+</div>
                    <div class="header__stars header__year"><span class="icon-solid"></span><strong>${filmRating}</strong></div>
                </div>
                <p class="header__descr">
                    ${sm.description}
                </p>
                <div class="header__buttons">
                    <a href="${sm.webUrl}" class="header__watch"><span class="icon-solid"></span>watch</a>
                    <a href="#" class="header__more header__watch movie__item" data-id="${sm.filmId}">More information</a>
                </div>
            `;
        })
        .then(()=>{
            anime.classList.remove('active');
            let headerMore = document.querySelector('.header__more');
            headerMore.addEventListener('click', function(e){
                e.preventDefault();
                let attr = this.getAttribute('data-id');
                openMainBlock(e);
                renderSolo(attr);
            })
        })
        .catch(e => {
            anime.classList.remove('active');
        })
    })
    .catch(e => {
        anime.classList.remove('active');
    })
}

//рендер пагинации для запросов
function renderPagination(cur=1, len){
    pagination.innerHTML = '';
    let  ul = document.createElement('ul');
    let lis = len < 14 ? len : 14;
    ul.classList.add('header__list');
    for (let i = 1; i <= lis; i++) {
           let li = document.createElement('li');
               li.innerHTML = `<a href="#" data-page="${i}" class="pagination__link ${i == cur ? 'active' : ''}">${i}</a>`;
            ul.append(li);
    }
    pagination.append(ul);
}

//вывод карточек с фильмами при поиске или первом открытии ссылки с фильмами
function renderCards(page=1, se='', fn = 'getTopMovies') { 
    mainBlock.innerHTML = '';
    movieSolo.innerHTML = '';
    db[fn](page, se).then(data=>{
        // console.log(data);
        if(data.films.length > 0){
            data.films.forEach(item=>{
                let someItem = document.createElement('div');
                someItem.classList.add('some__item');
                someItem.innerHTML = `
                   <div class="some__img">
                     <img src="${item.posterUrlPreview}" alt="${item.nameRu} ${item.nameEn}" loading="lazy">
                     <span class="some__rating">${item.rating !== undefined ? item.rating : '??'}</span>
                   </div>
                     <h3 class="some__title">${item.nameRu !== '' ? item.nameRu : item.nameEn}</h3>
                `;
                 someItem.setAttribute('data-id', item.filmId);
                 mainBlock.append(someItem);
             })
        }
        else{
            mainBlock.innerHTML = '<p class="undefined">Ничего не найдено</p>';
        }
        renderPagination(page, data.pagesCount);
    }).then(()=>{
        let film = document.querySelectorAll('.some__item');
        film.forEach(item=>item.addEventListener('click', function(e) {
            let attr = this.getAttribute('data-id');
            renderSolo(attr);
        }));
    })
    .then(()=>{
        anime.classList.remove('active');
        clickPagination(se, fn);
    })
    .catch(e => {
        anime.classList.remove('active');
    })
}
//функция для переключения между страницами результатов
function clickPagination(val, fn){
    let pagLinks = document.querySelectorAll('.pagination__link');
    pagLinks.forEach(link=>{
        link.addEventListener('click', function(e){
            e.preventDefault();
            let dataPage = this.getAttribute('data-page');
            renderCards(dataPage, val, fn);
        })
    })
}

//рендер информации об одном фильме
async function renderSolo(id){
    pagination.innerHTML = '';
    mainBlock.innerHTML = '';
    anime.classList.add('active');
   (async function(){
       const [reviews, frames, solo] = await Promise.all([
            db.getReviews(id),
            db.getFrames(id),
            db.getSoloFilm(id)
        ])
        return {reviews, frames, solo};
   }())
   .then(res => {
       let solo = res.solo.data;
       let genres = solo.genres.reduce((acc, item) => acc + `${item.genre} `, '');
       let countries = solo.countries.reduce((acc, item) => acc + `${item.country} `, '');
        let facts = '';
        let frames = '';
        let reviews = '';
        res.frames.frames.forEach((item, i) => {
            if(i < 10) frames += `<img src="${item.preview}" alt="" loading="lazy">`;
        })
        solo.facts.forEach((item, i) => {
            if(i < 10) facts += `<li class="solo__facts">${i+1}: ${item}</li>`;
        });
        res.reviews.reviews.forEach((item, i) => {
            if(i < 10) {
                reviews += `<div class="review__item">
                                <span>${item.reviewAutor}</span>
                                <p class="review__descr">${item.reviewDescription}</p>
                            </div>`;
            }
        })
       let div = `
       <div class="solo__img">
               <img src="${solo.posterUrlPreview}" alt="${solo.nameEn}">
               <a href="${solo.webUrl}" class="solo__link header__watch">Смотреть фильм</a>
           </div>
           <div class="solo__content">
               <h3 class="solo__title trend__tv-title">${solo.nameRu !== '' ? solo.nameRu : solo.nameEn}</h3>
               <ul>
                   <li class="solo__countries">Страны: ${countries}</li>
                   <li class="solo__genres">Жанры: ${genres}</li>
                   <li class="solo__dur">Продолжителность: ${solo.filmLength}</li>
                   <li class="solo__year">Год: ${solo.year}</li>
                   <li class="solo__premiere">Мировая премьера: ${solo.premiereWorld}</li>
                   <li class="solo__rating">Возрастной рейтинг: ${solo.ratingAgeLimits}+</li>
                   <li class="solo__slogan">Слоган: ${solo.slogan}</li>
                   <li class="header__descr solo__descr">Описание: ${solo.description}</li>
               </ul>
           </div>
           <ul class="solo__facts">
           <h3 class="trend__tv-title">Интересные факты</h3>
          ${facts}
           </ul>
           <h3 class="solo__title2 trend__tv-title">Фото</h3>
           <div class="solo__images">
           ${frames}
           </div>
           <div class="solo__reviews">
           <h3 class="solo__title2 trend__tv-title">Отзывы</h3>
           ${reviews}
           </div>
        `;
            movieSolo.innerHTML = div;
            anime.classList.remove('active');
        })
    .catch(e => {
       anime.classList.remove('active');
   })
}
//поиск
formMain.addEventListener('submit', function(e){
    e.preventDefault();
    anime.classList.add('active');
    renderCards(1, formInput.value, 'getSearch');
})

