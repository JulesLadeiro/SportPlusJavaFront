// const url = "http://localhost:8080"; // local
const url = "https://sportplus.alwaysdata.net"; // prod
const isProd = true;
const baseUrl = isProd ? "/SportPlusJavaFront" : "";

document.addEventListener("DOMContentLoaded", () => {
    const authenticated = localStorage.getItem("user") ?? false;
    switch (true) {
        case window.location.pathname.includes(`${baseUrl}/logout`):
        case authenticated === false && !(window.location.pathname.includes(`${baseUrl}/connection`) || window.location.pathname.includes(`${baseUrl}/inscription`)):
            console.log("redirect to connection");
            window.location.href = `${baseUrl}/connection`;
            break;
        case window.location.pathname.includes(`${baseUrl}/connection`) || window.location.pathname.includes(`${baseUrl}/inscription`):
            if (authenticated) localStorage.removeItem("user");
            break;
        case window.location.pathname.includes(`${baseUrl}/productpage`):
            loadProduct();
            break;
        case window.location.pathname.includes(`${baseUrl}/admin`):
            checkStoreStatus();
            break;
        case window.location.pathname.includes(`${baseUrl}/account`):
            checkStoreStatus();
            loadAccount();
            break;
        case window.location.pathname.includes(`${baseUrl}/addprod`):
            checkStoreStatus();
            loadMyProduct();
            break;
        case window.location.pathname.includes(`${baseUrl}/index`) || window.location.pathname == `${baseUrl}/`:
            loadIndexDatas();
            break;
        default:
            break;
    }
});

const loadAccount = () => {
    const account = JSON.parse(localStorage.getItem("user"));
    document.getElementById('editUsername').value = account.username;
};

const editAccount = async () => {
    const editBtn = document.getElementById('editBtn');
    editBtn.disabled = true;
    const name = document.getElementById('editUsername').value;
    const password = document.getElementById('editPassword').value;

    if (password.length == 0) {
        const info = document.getElementById('inf');
        info.innerHTML = 'Veuillez renseigner un mot de passe.';
        editBtn.disabled = false;
        return;
    }

    const user = JSON.parse(localStorage.getItem('user'));

    const data = {
        ...user,
        username: name,
        password
    };

    const response = await fetch(`${url}/user`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data)
    });
    const res = await response.json();

    if (res) {
        localStorage.setItem('user', JSON.stringify(data));
        const info = document.getElementById('inf');
        info.innerHTML = 'Vos informations ont bien été modifiées !';
    } else {
        const info = document.getElementById('inf');
        info.innerHTML = 'Une erreur est survenue, veuillez réessayer.'
    }

    editBtn.disabled = false;
};

const loadIndexDatas = async () => {
    const res1 = await fetch(`${url}/catalogue`);
    const res2 = await fetch(`${url}/product`);

    const catalogue = await res1.json();
    const products = await res2.json();

    const catalogueDiv = document.getElementById('container');

    catalogue.forEach(catalogue => {
        const newCatalogueDiv = document.createElement('div');
        newCatalogueDiv.className = 'row mt-3';
        newCatalogueDiv.innerHTML = `
        <h2>${catalogue.name}</h2>
        <hr class="mb-4 mt-0 d-inline-block mx-auto shop_name" />
        <div class = "row">
            ${products.map(product => {
            if (product.catalogueid == catalogue.id) {
                return `<div class="card product_card col-lg-4 col-md-12 mx-3 mb-3" style="width: 18rem;">
                    <img class="card-img-top" src="${product.picture}" alt="Card image cap">
                    <div class="card-body">
                      <h5 class="card-title">${product.productname}</h5>
                      <p class="card-text">${product.description}</p>
                      <a href="productpage?id=${product.id}" class="btn btn-primary">Acheter</a>
                      <span>${product.price}€</span>
                    </div>
                  </div>`;
            }
        }).join('')}
        </div   >`;
        catalogueDiv.appendChild(newCatalogueDiv);
    })
}

const loadProduct = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    const response = await fetch(`${url}/product/${id}`);
    const product = await response.json();

    const productDiv = document.getElementById('product');
    productDiv.innerHTML = `<div class="col-lg-4 col-md-12 d-flex justify-content-center">
        <img class="product_image" src="${product.picture}" alt="">
    </div>
    <div class="col-lg-4 col-md-12 description_block">
        <div class="row pt-5">
            <div class="col-12 mb-2"><h3>${product.productname}</h3></div>
        <div class="col-12 mb-2">
            <p>${product.description}</p>
        </div>
            <div class="col-12"><h5>${product.price} €</h5> </div>
        </div>
    </div>`;
};

const checkStoreStatus = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user.role === "CLIENT") {
        const div = document.getElementById('store');
        div.innerHTML = `<h6
            class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted text-uppercase">
            <span>Gestion du Store</span>
            <a class="link-secondary" href="#" aria-label="Add a new report">
                <span data-feather="plus-circle" class="align-text-bottom"></span>
            </a>
        </h6>
        <ul class="nav flex-column">
            <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="index">
                    <span data-feather="home" class="align-text-bottom"></span>
                    Catalogues
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="addprod">
                    <span data-feather="file" class="align-text-bottom"></span>
                    Gestion de produit
                </a>
            </li>
        </ul>`;
    }
};

const loadMyProduct = async () => {
    const response = await fetch(`${url}/product`);
    const response2 = await fetch(`${url}/catalogue`);
    const catalogues = (await response2.json()).filter(catalogue => catalogue.userid == JSON.parse(localStorage.getItem('user')).id);
    const products = (await response.json()).filter(product => catalogues.map(catalogue => catalogue.id).includes(product.catalogueid));

    const productDiv = document.getElementById('prodTable');
    productDiv.innerHTML = "";

    products.forEach(product => {
        productDiv.innerHTML += `<tr>
            <th scope="row">${product.id}</th>
            <td>${product.productname}</td>
            <td>${product.description}</td>
            <td>${product.price}</td>
            <td><div class="btn-group d-flex justify-content-center">
                <button onclick="editMyProductInt(${product.id})" type="button" class="btn btn-sm btn-warning">Modifier</button>
                <button onclick="deleteMyProduct(${product.id})" type="button" class="btn btn-sm btn-danger">Supprimer</button>
            </div></td>
        </tr>`;
    });
}

const editMyProductInt = async (productId) => {
    const div = document.getElementById('crud');
    div.innerHTML = 'Chargement...';

    const response = await fetch(`${url}/product/${productId}`);
    const product = await response.json();

    div.innerHTML = `<div class="container form_Modifproduct">
        <h1 class="h3 mb-3 fw-normal">Modification de produit</h1>
        <div class="row g-3">
            <div class="col-12">
                <div class="input-group has-validation">                               
                    <input
                    type="text"
                    class="form-control"
                    id="productname"
                    placeholder="Nom du produit"
                    value="${product.productname}"
                    required
                    />
                </div>
            </div>
            <div class="col-12">
                <div class="input-group has-validation">                               
                    <input
                    type="text"
                    class="form-control"
                    id="productdescription"
                    placeholder="Description du produit"
                    value="${product.description}"
                    required
                    />
                </div>
            </div>
            <div class="col-12">
            <input
            type="number"
            class="form-control"
            id="productprice"
            placeholder="prix"
            value="${product.price}"
            required
            />
            </div>
            <div class="col-12">             
                <input class="form-control" type="file" id="productimg">            
            </div>
        </div>
        <button onclick="editMyProduct(${productId})" id="editMyProductButton" class="w-100 btn btn-primary btn-lg mt-3">
            Modifier
        </button>
    </div>`;
};

const createMyProductInt = () => {
    const div = document.getElementById('crud');
    div.innerHTML = `<div class="container form_product">
        <h1 class="h3 mb-3 fw-normal">Création de produit</h1>
        <div class="row g-3">
            <div class="col-12">
                <div class="input-group has-validation">
                    <input type="text" class="form-control" id="productname"
                        placeholder="Nom du produit" required />
                </div>
            </div>
            <div class="col-12">
                <div class="input-group has-validation">
                    <input type="text" class="form-control" id="productdescription"
                        placeholder="Description du produit" required />
                </div>
            </div>
            <div class="col-12">
                <input type="number" class="form-control" id="productprice" placeholder="Prix" required />
            </div>
            <div class="col-12">             
                <input class="form-control" type="file" id="productimg">            
            </div>
        </div>
        <button onclick="createMyProduct()" id="productCreationButton" class="w-100 btn btn-primary btn-lg mt-3">
            Créer
        </button>
    </div>`;
};

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

const editMyProduct = async (id) => {
    const div = document.getElementById('crud');
    const productname = document.getElementById('productname').value;
    const productdescription = document.getElementById('productdescription').value;
    const productprice = document.getElementById('productprice').value;
    let productimg = document.querySelector('#productimg')?.files?.[0] ?? false;

    try {
        div.innerHTML = 'Chargement...';
        let dataToPost = {
            productname,
            productdescription,
            productprice,
            productimg
        };

        const resCatalogue = await fetch(`${url}/catalogue`, {
            method: 'GET'
        });

        const catalogues = await resCatalogue.json();
        const catalogue = catalogues.filter(catalogue => catalogue.userid == JSON.parse(localStorage.getItem('user')).id)[0];

        dataToPost.picture = catalogue.picture;
        dataToPost.catalogueid = catalogue.id;

        if (productimg) {
            productimg = await toBase64(productimg);
            dataToPost.picture = productimg;
        };

        const res = await fetch(`${url}/product/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(dataToPost)
        });

        if (res.status == 500) throw new Error('Erreur... Votre image peut être trop grande');
        if (![200, 201].includes(res.status)) throw new Error('Erreur lors de la création du produit...');

        div.innerHTML = 'Produit mis à jour avec succès';
        await loadMyProduct();
    } catch (err) {
        console.log(err);
        div.innerHTML = typeof error == 'string' ? error : 'Erreur...';

    }
};

const createMyProduct = async () => {
    const div = document.getElementById('crud');
    const productname = document.getElementById('productname').value;
    const productdescription = document.getElementById('productdescription').value;
    const productprice = document.getElementById('productprice').value;
    let productimg = document.querySelector('#productimg').files[0];

    try {
        div.innerHTML = 'Chargement...';
        productimg = await toBase64(productimg);

        const resCatalogue = await fetch(`${url}/catalogue`, {
            method: 'GET'
        });

        const catalogues = await resCatalogue.json();
        const catalogue = catalogues.filter(catalogue => catalogue.userid == JSON.parse(localStorage.getItem('user')).id)[0];

        const res = await fetch(`${url}/product`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productname,
                description: productdescription,
                price: productprice,
                picture: productimg,
                catalogueid: catalogue.id
            })
        });

        if (res.status == 500) throw new Error('Erreur... Votre image peut être trop grande');
        if (![200, 201].includes(res.status)) throw new Error('Erreur lors de la création du produit...');

        div.innerHTML = 'Crée avec succès !';
        await loadMyProduct();
    } catch (error) {
        div.innerHTML = typeof error == 'string' ? error : 'Erreur...';
    }
};

const deleteMyProduct = async (id) => {
    const productDiv = document.getElementById('prodTable');
    productDiv.innerHTML = "Chargement...";

    await fetch(`${url}/product/${id}`, {
        method: 'DELETE'
    });

    await loadMyProduct();
};

const signup = async () => {
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const email = document.getElementById('signupEmail').value;
    const role = document.getElementById('roleSelect').value;

    document.getElementById('signupButton').disabled = true;

    await fetch(`${url}/user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password,
            email,
            role
        })
    });

    window.location.href = `${baseUrl}/connection`;
}

const login = async () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    document.getElementById('loginButton').disabled = true;

    const response = await fetch(`${url}/authenticate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password
        })
    });

    if (response.status === 403) {
        document.getElementById('loginError').innerHTML = "Wrong email or password";
        document.getElementById('loginButton').disabled = false;
    } else {
        const user = await response.json();
        localStorage.setItem('user', JSON.stringify(user));
        if (user.role === "CLIENT") {
            return window.location.href = `${baseUrl}/admin`;
        }
        return window.location.href = `${baseUrl}/index`;
    }
}