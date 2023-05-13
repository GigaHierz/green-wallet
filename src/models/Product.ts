import { TextUtils } from "../utils/TextUtils";

export interface ProductCollection {
    title: string,
    slug: string,
    image: string,
    description: string,
    products?: Product[]
}

export interface Product {
    title: string,
    image: string,
    description: string,
}

export const SAMPLE_EVENTS : ProductCollection[] = [
    {
      title: 'Taylor Swift | The Eras Tour - Austin - March 15, 2023',
      image: 'https://i.scdn.co/image/ab6761610000e5eb5a00969a4698c3132a15fbb0',
      description: 'FRI, MAR 17, 2023 STATE FARM STADIUM Glendale, AZ with Paramore & GAYLE https://www.taylorswift.com/events/',
    },
    {
      title: 'Burnaboy Love Damini Concert - London, UK - January 25, 2023',
      image: 'https://i.scdn.co/image/ab6761610000e5eba0e4780f120345edddeaada9',
      description: '03JUNLONDON STADIUM, QUEEN ELIZABETHLONDON, UK https://www.onaspaceship.com/tour',
    },
    {
      title: 'Blue Mountain Skiing Day Pass - January 20, 2023',
      image: 'https://southgeorgianbay.ca/wp-content/uploads/2022/02/night-skiing.jpg',
      description: 'Adult Day Lift Ticket. See: https://book.bluemountain.ca/ecomm/shop/calendar/3603699/en-us?productcategoryid=117',
    },
    {
      title: 'Blue Mountain Skiing Day Pass - January 21, 2023',
      image: 'https://southgeorgianbay.ca/wp-content/uploads/2022/02/night-skiing.jpg',
      description: 'Adult Day Lift Ticket. See: https://book.bluemountain.ca/ecomm/shop/calendar/3603699/en-us?productcategoryid=117',
    },
  ].map(value => ({...value, slug: TextUtils.slugify(value.title)}));