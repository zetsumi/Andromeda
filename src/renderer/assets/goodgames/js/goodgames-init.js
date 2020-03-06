import { options } from './parts/_options';

if (typeof window.GoodGames !== 'undefined') {
    window.GoodGames.setOptions(options);
    window.GoodGames.init();
}
