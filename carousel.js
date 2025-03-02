function generateCarousel(containerId, images) {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Container with id ${containerId} not found.`);
        return;
    }

    const carouselId = 'carousel-' + Math.random().toString(36).substring(2, 9);

    let carouselHTML = `
    <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel" data-bs-interval="0">
    <ol class="carousel-indicators">
    `;

    images.forEach((image, index) => {
    carouselHTML += `
    <li data-bs-target="#${carouselId}" data-bs-slide-to="${index}" class="${index === 0 ? 'active' : ''}"></li>
    `;
    });

    carouselHTML += `
    </ol>
    <div class="carousel-inner">
    `;

    images.forEach((image, index) => {
    carouselHTML += `
    <div class="carousel-item ${index === 0 ? 'active' : ''}">
    <img src="${image.src}" class="d-block w-100" alt="${image.alt}">
    </div>
    `;
    });

    carouselHTML += `
    </div>
        <a class="carousel-control-prev" href="#${carouselId}" role="button" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
        </a>
        <a class="carousel-control-next" href="#${carouselId}" role="button" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
        </a>
    </div>
    `;

    container.innerHTML = carouselHTML;
}

personal_proj_imgs = [];
for(let i = 1; i < 12; i++){
    personal_proj_imgs.push(
        [
            { src: 'imgs/personal/'+i+'/1.png', alt: 'First slide' },
            { src: 'imgs/personal/'+i+'/2.png', alt: 'Second slide' },
            { src: 'imgs/personal/'+i+'/3.png', alt: 'Third slide' },
        ]);
}

// this is like really terrible but its a static website for now that i will end up redoing entirely soooo
personal_proj_imgs[0][0] = { src: 'imgs/personal/1/1.gif', alt: 'First slide' };

personal_proj_imgs[7] = [
            { src: 'imgs/personal/8/2.gif', alt: 'First slide' },
            { src: 'imgs/personal/8/3.gif', alt: 'Second slide' },
            { src: 'imgs/personal/8/1.png', alt: 'Third slide' },
        ];
personal_proj_imgs[8] = [
            { src: 'imgs/personal/9/1.gif', alt: 'First slide' },
            { src: 'imgs/personal/9/2.png', alt: 'Second slide' },
            { src: 'imgs/personal/9/3.png', alt: 'Third slide' },
        ];

for(let i = 1; i < 12; i++){
    generateCarousel('carousel-personal-'+i, personal_proj_imgs[i-1]);
}

freelance_proj_imgs = [];
for(let i = 1; i < 7; i++){
    freelance_proj_imgs.push(
        [
            { src: 'imgs/freelance/'+i+'/1.png', alt: 'First slide' },
            { src: 'imgs/freelance/'+i+'/2.png', alt: 'Second slide' },
            { src: 'imgs/freelance/'+i+'/3.png', alt: 'Third slide' },
        ]);
}

for(let i = 1; i < 7; i++){
    generateCarousel('carousel-freelance-'+i, freelance_proj_imgs[i-1]);
}
