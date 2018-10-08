// eslint-disable-next-line import/named
import { all } from 'superheroes'
import pokemon from './pokemon'
import superb from './superb'
import yesNo from './yes-no'
import cities from './cities'
import http from './http'
import elements from './elements'

export default [...all, ...cities, ...http, ...elements, ...yesNo, ...superb, ...pokemon]
