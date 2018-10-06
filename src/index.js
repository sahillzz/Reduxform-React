/**
 * THIS IS THE ENTRY POINT FOR THE CLIENT, JUST LIKE server.js IS THE ENTRY POINT FOR THE SERVER.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { applyRouterMiddleware, Router, browserHistory, match } from 'react-router';
import { bindActionCreators } from 'redux';
import { syncHistoryWithStore, replace } from 'react-router-redux';
import { ReduxAsyncConnect } from 'redux-connect';
import { useScroll } from 'react-router-scroll';
import { createApp } from 'app';
import { Provider } from './components';
import HotEnabler from './components/HotEnabler';
import createStore from './redux/create';
import apiClient from './helpers/apiClient';
import getRoutes from './routes';

const client = apiClient();
const app = createApp('rest');
const dest = document.getElementById('root');

(async () => {
	const store = createStore(browserHistory, { client, app }, window.__data);
	const history = syncHistoryWithStore(browserHistory, store);

	const redirect = bindActionCreators(replace, store.dispatch);

	const renderRouter = props => (
		<ReduxAsyncConnect
			{...props}
			helpers={{ client, app, redirect }}
			filter={item => !item.deferred}
			render={applyRouterMiddleware(useScroll())}
		/>
	);

	const render = routes => {
		match({ history, routes }, (error, redirectLocation, renderProps) => {
			ReactDOM.hydrate(
				<HotEnabler>
					<Provider store={store} app={app} key="provider">
						<Router {...renderProps} render={renderRouter} history={history}>
							{routes}
						</Router>
					</Provider>
				</HotEnabler>,
				dest,
			);
		});
	};

	render(getRoutes(store));

	if (module.hot) {
		module.hot.accept('./index');
		module.hot.accept('./routes', () => {
			const nextGetRoutes = require('./routes').default;
			render(nextGetRoutes(store));
		});
	}

	// if (!__DEVELOPMENT__ && 'serviceWorker' in navigator) {
	// 	window.addEventListener('load', async () => {
	// 		try {
	// 			await navigator.serviceWorker.register('/dist/service-worker.js', { scope: '/' });
	// 			console.log('Service worker registered!');
	// 		} catch (error) {
	// 			console.log('Error registering service worker: ', error);
	// 		}

	// 		await navigator.serviceWorker.ready;
	// 		console.log('Service Worker Ready');
	// 	});
	// }
})();
