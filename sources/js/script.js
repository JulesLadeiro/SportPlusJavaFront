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
        case window.location.pathname.includes(`${baseUrl}/addprod`):
            loadMyProduct();
            break;
        case window.location.pathname.includes(`${baseUrl}/index`) || window.location.pathname == `${baseUrl}/`:
            loadIndexDatas();
            break;
        default:
            break;
    }
});

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
                return `<div class="card product_card col-lg-4 col-md-12 mx-3 mb-1" style="width: 18rem;">
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
}

const loadMyProduct = async () => {
    const response = await fetch(`${url}/product`);
    const response2 = await fetch(`${url}/catalogue`);
    const catalogues = (await response2.json()).filter(catalogue => catalogue.userid == JSON.parse(localStorage.getItem('user')).id);
    const products = (await response.json()).filter(product => catalogues.map(catalogue => catalogue.id).includes(product.catalogueid));

    const productDiv = document.getElementById('prodTable');
    productDiv.innerHTML = "";

    products.forEach(product => {
        productDiv.innerHTML = `<tr>
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
            <input
            type="number"
            class="form-control"
            id="price"
            placeholder="prix"
            value="${product.price}"
            required
            />
            </div>
            <div class="col-12">
            <input
            type="text"
            class="form-control"
            id="signupUsername"
            placeholder="Username"
            required
            />
            </div>
        </div>
        <button onclick="signup()" id="signupButton" class="w-100 btn btn-primary btn-lg mt-3">
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
                <input type="text" class="form-control" id="price" placeholder="prix" required />
            </div>
            <div class="col-12">
                <input type="text" class="form-control" id="signupUsername" placeholder="Username"
                    required />
            </div>
            <div class="col-12">             
                <input class="form-control" type="file" id="formFile">            
            </div>
            <div class="col-12">             
            <select class="form-select" aria-label="Default select example">
                <option selected>Selectionner le catalogue ...</option>
                // Boucle for des shop dispo
                <option value="1">One</option>                
            </select>            
            </div>

        </div>
        <button onclick="signup()" id="signupButton" class="w-100 btn btn-primary btn-lg mt-3">
            Créer
        </button>
    </div>`;
};

const editMyProduct = async () => {

};

const createMyProduct = async () => {

};

const deleteMyProduct = async () => {
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

    document.getElementById('signupButton').disabled = true;

    await fetch(`${url}/user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password,
            email
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