# -*- coding: utf-8 -*-
import scrapy
from posters.items import PostersItem

class PosterSpider(scrapy.Spider):
    name = "posters-spider"
    urls = []

    for i in range(10):
        year = 2008 + i
        urls.append('https://letterboxd.com/films/popular/year/' + str(year) + '/size/large/')

    start_urls = urls


    def parse(self, response):
		# access to the data base
        database_url = response.css('#films-browser-list-container').xpath('@data-url')
        home = 'https://letterboxd.com'
        yield scrapy.Request(home + str(database_url.extract_first()), self.parse_page)


    def parse_page(self, response):
        # loop over all movies listed in the page just to the page and parse information
        title_list = response.css('ul li .react-component').xpath('@data-film-name').extract()
        img_url = response.css('ul li .react-component').css('img').xpath('@src').extract()
        data_id = response.css('ul li .react-component').xpath('@data-film-id').extract()
        for i in range(len(data_id)):
            img = img_url[i].split('?k=')[0]
            yield PostersItem(
                title = title_list[i],
                data_id = data_id[i],
                file_urls = [img])

        home = 'https://letterboxd.com'
        next_url = home + str(response.css('.pagination').css('.paginate-nextprev').css('.next').xpath('@href').extract_first())
        page = int(response.css('.pagination').css('.paginate-nextprev').css('.next').xpath('@href').extract_first().split('/page/')[1].split('/')[0])
        if page < 30:
            yield scrapy.Request(next_url, self.parse)
