import '../css/main.css';
import ImageGalleryProvider from '../components/providers/ImageGalleryProvider';

export default function MyApp({ Component, pageProps }) {
    const galleries = pageProps.galleries || [];

    return (
        <ImageGalleryProvider galleries={galleries}>
            <Component {...pageProps} />
        </ImageGalleryProvider>
    );
}
