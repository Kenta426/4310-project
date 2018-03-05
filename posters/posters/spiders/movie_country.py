# -*- coding: utf-8 -*-
import scrapy
from posters.items import MovieCountry

class PosterSpider(scrapy.Spider):
    name = "movie-country"
    urls = []

    for i in range(10):
        year = 2008 + i
        urls.append('https://letterboxd.com/films/popular/year/' + str(year) + '/size/large/')

    start_urls = urls

    def parse(self, response):
		# access to the data base
        database_url = response.css('#films-browser-list-container').xpath('@data-url')
        home = 'https://letterboxd.com'
        yield scrapy.Request(home + str(database_url.extract_first()), self.parse_movie_link)


    def parse_movie_link(self, response):
        home = 'https://letterboxd.com'
        movie_url = response.css('ul .listitem .react-component').xpath('@data-target-link').extract()
        for movie in movie_url:
            data_url = home + str(movie) + 'details/'
            yield scrapy.Request(data_url, self.parse_movie_data)

        # next_url = home + str(response.css('.paginate-next').xpath('@href').extract_first())
        next_url = home + str(response.css('.pagination').css('.paginate-nextprev').css('.next').xpath('@href').extract_first())
        # page = int(response.css('.paginate-next').xpath('@href').extract_first().split('/page/')[1].split('/')[0])
        page = int(response.css('.pagination').css('.paginate-nextprev').css('.next').xpath('@href').extract_first().split('/page/')[1].split('/')[0])
        if page < 30:
            yield scrapy.Request(next_url, self.parse)

    def parse_movie_data(self, response):
        # genre = response.xpath('//div [@class = "col-17"]')\
        # .xpath('//div [@id = "tab-genres" ]')\
        # .css('a::text').extract()
        # if len(genre) == 0:
        #     genre = [unicode('None', 'unicode-escape')]

        data_id =  response.xpath('//div [@id = "film-page-wrapper"]')\
        .css('.poster-list')\
        .xpath('//div')\
        .xpath('@data-film-id').extract_first()
        if len(data_id) == 0:
            data_id = unicode('None', 'unicode-escape')

        title = response.xpath('//div [@class = "col-17"]').css('#featured-film-header').css('h1::text').extract_first()
        if len(title) == 0:
            title = unicode('None', 'unicode-escape')

        director = response.xpath('//div [@class = "col-17"]')\
        .css('#featured-film-header').css('[itemprop=director]').css('[itemprop=name]').css('::text').extract_first()
        if len(director) == 0:
            director = unicode('None', 'unicode-escape')

        country = response.xpath('//div [@class = "col-17"]').xpath('//div [@id = "tab-details" ]')\
        .xpath('//a[contains(@href,\'country\')]').css('::text').extract_first()
        if len(country) == 0:
            country = unicode('None', 'unicode-escape')

        yield MovieCountry(
            data_id = data_id,
            country = country,
            director = director)
