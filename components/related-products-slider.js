document.addEventListener('DOMContentLoaded', function() {
    // Initialize Related Products Slider
    const relatedProductsSlider = document.querySelector('.related-products-slider');
    if (relatedProductsSlider) {
        new BlazeSlider(relatedProductsSlider, {
            all: {
                enableAutoplay: false,
                transitionDuration: 500,
                transitionTimingFunction: 'ease-in-out',
                slidesToScroll: 1,
                loop: true,
            },
            '(max-width: 640px)': {
                slidesToShow: 1,
                slideGap: '1rem',
            },
            '(min-width: 640px)': {
                slidesToShow: 2,
                slideGap: '1rem',
            },
            '(min-width: 768px)': {
                slidesToShow: 3,
                slideGap: '1.5rem',
            },
            '(min-width: 1024px)': {
                slidesToShow: 4,
                slideGap: '1.5rem',
            },
        });
    }
});
