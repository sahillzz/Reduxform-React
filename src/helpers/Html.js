import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom/server';
import serialize from 'serialize-javascript';

// Import Components
import Helmet from 'react-helmet';

// Import Config
import config from '../../config';

/**
 * Wrapper component containing HTML metadata and boilerplate tags.
 * Used in server-side code only to wrap the string output of the
 * rendered route component.
 *
 * The only thing this component doesn't (and can't) include is the
 * HTML doctype declaration, which is added to the rendered output
 * by the server.js file.
 */
export default function Html({ assets, component, store }) {
	const content = component ? ReactDOM.renderToString(component) : '';
	const head = Helmet.renderStatic();
	const isDev = process.env.NODE_ENV === 'development';
	const dllHost = `http://${config.host}:${config.port + 1}`;

	/* eslint-disable react/no-danger */
	return (
		<html lang="en-US">
			<head>
				{head.base.toComponent()}
				{head.title.toComponent()}
				{head.meta.toComponent()}
				{head.link.toComponent()}
				{head.script.toComponent()}

				<link rel="shortcut icon" href="/favicon.ico" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="manifest" href="/manifest.json" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="application-name" content="MStar SES" />
				<meta name="apple-mobile-web-app-status-bar-style" content="black" />
				<meta name="apple-mobile-web-app-title" content="MStar SES" />
				<meta name="theme-color" content="#3677dd" />

				<link
					href="https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css"
					rel="stylesheet"
				/>
				<link
					href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700"
					rel="stylesheet"
				/>

				<link
					href="https://maxcdn.icons8.com/fonts/line-awesome/1.1/css/line-awesome-font-awesome.min.css"
					rel="stylesheet"
				/>

				{/* styles (will be present only in production with webpack extract text plugin) */}
				{assets.styles &&
					Object.keys(assets.styles).map(style => (
						<link
							href={assets.styles[style]}
							key={style}
							media="screen, projection"
							rel="stylesheet"
							type="text/css"
							charSet="UTF-8"
						/>
					))}

				{/* (will be present only in development mode) */}
				{assets.styles && Object.keys(assets.styles).length === 0 ? (
					<style dangerouslySetInnerHTML={{ __html: '#root{display:none}' }} />
				) : null}
			</head>
			<body>
				<div id="root" dangerouslySetInnerHTML={{ __html: content }} />
				{store && (
					<script
						dangerouslySetInnerHTML={{
							__html: `window.__data=${serialize(store.getState())};`,
						}}
						charSet="UTF-8"
					/>
				)}
				{isDev && <script src={`${dllHost}/dist/dlls/vendor.dll.js`} charSet="UTF-8" />}
				{!isDev && assets.javascript && <script src={assets.javascript.runtime} charSet="UTF-8" />}
				{!isDev && assets.javascript && <script src={assets.javascript.vendor} charSet="UTF-8" />}
				{assets.javascript && <script src={assets.javascript.main} charSet="UTF-8" />}

				{/* (will be present only in development mode) */}
				{assets.styles && Object.keys(assets.styles).length === 0 ? (
					// eslint-disable-next-line max-len
					<script
						dangerouslySetInnerHTML={{
							__html: 'document.getElementById("root").style.display="block";',
						}}
					/>
				) : null}
				<script
					dangerouslySetInnerHTML={{
						__html: `
								if (navigator && navigator.serviceWorker) {
									navigator.serviceWorker.getRegistrations().then(function(registrations) {
										if (registrations[0]) {
											registrations[0].unregister();
										}
									});
								}
							`,
					}}
				/>
			</body>
		</html>
	);
	/* eslint-enable react/no-danger */
}

Html.propTypes = {
	assets: PropTypes.shape({
		styles: PropTypes.object,
		javascript: PropTypes.object,
	}),
	component: PropTypes.node.isRequired,
	store: PropTypes.shape({ getState: PropTypes.func }).isRequired,
};

Html.defaultProps = { assets: {} };
