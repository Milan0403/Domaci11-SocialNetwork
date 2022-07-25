var contentList = [];
var creatorList = [];

let session = new Session();
session_id = session.getSession();

if(session_id !== ""){

	async function populateUserData() {
		let user = new User();
		user = await user.get(session_id);
		document.querySelector('#username').innerText = user['username'];
		document.querySelector('#email').innerText = user['email'];

		document.querySelector('#korisnicko_ime').value = user['username'];
		document.querySelector('#edit_email').value = user['email'];
	}

	populateUserData();
} else{
	window.location.href = "/";
}

document.querySelector('#logout').addEventListener('click', e =>{
	e.preventDefault();

	session.destroySession();
	window.location.href = '/';
});

document.querySelector('#editAccount').addEventListener('click', () =>{
	document.querySelector('.custom-modal').style.display = 'block';
})

document.querySelector('#closeModal').addEventListener('click', () =>{
	document.querySelector('.custom-modal').style.display = 'none';
});

document.querySelector('#editForm').addEventListener('submit', e =>{
	e.preventDefault();

	let user = new User();
	user.username = document.querySelector('#korisnicko_ime').value;
	user.email = document.querySelector('#edit_email').value;
	user.edit();
});

document.querySelector('#deleteProfile').addEventListener('click', e =>{
	e.preventDefault();

	let text = 'Da li ste sigurni da zelite da obrisete profil?';
	if(confirm(text) === true){
		let user = new User();
		user.delete();
	}
});

document.querySelector('#postForm').addEventListener('submit', e =>{
	e.preventDefault();
	async function createPost() {
		let content = document.querySelector('#postContent').value;
		document.querySelector('#postContent').value = '';

		let post = new Post();
		post.post_content = content;
		post = await post.create();
		
		let current_user = new User();
		current_user = await current_user.get(session_id);

		let html =document.querySelector('#allPostsWrapper').innerHTML;

		let delete_post_html = '';

		if(session_id === post.user_id){
			delete_post_html = '<button class="remove-btn" onclick="removeMyPost(this)">Remove</button>';
		}

		document.querySelector('#allPostsWrapper').innerHTML = `<div class="single-post  ${current_user.username}" data-post_id="${post.id}">
																	<div class="post-content">${post.content}</div>
																	
																	<div class="post-actions">
																		<p><b>Autor: </b>${current_user.username}</p>
																		<div>
																			<button onclick="likePost(this)" class="likePostJs like-btn"><span>${post.likes}</span> Likes</button>
																			<button class="comment-btn" onclick="commentPost(this)">Comments</button>
																			${delete_post_html}
																		</div>
																	</div>

																	<div class="post-comments">
																		<form>
																			<input placeholder="Napisi komentar..." type="text">
																			<button onclick="commentPostSubmit(event)">Comment</button>
																		</form>
																	</div>
																</div>
																` + html;
		location.reload();
	}
	createPost();
});


async function getAllPosts() {
	let all_posts = new Post();
	all_posts = await all_posts.getAllPosts();
	console.log(all_posts);

	all_posts.forEach(post => {
		async function getPostUser() {
			let user = new User();
			user = await user.get(post.user_id);
			//console.log(user);
			//************************************************************
			//contentList.push(post.content);
			//console.log(contentList);
			

			let html1 = document.querySelector('#chooseOption').innerHTML;
			let post_username = user.username;
			if(creatorList.includes(post_username) !== true){
				creatorList.push(user.username);
				document.querySelector('#chooseOption').innerHTML = html1 + `<option value="${post_username}">${post_username}</option>`;
			}
			//*********************************************************
			let comments = new Comment();
			comments = await comments.get(post.id);

			let comments_html = '';

			if(comments.length > 0){
				comments.forEach(comment => {
					comments_html += `<div class="single-comment"><b>${comment.username}: </b>${comment.content}</div>`;
				});
			}


			let html =document.querySelector('#allPostsWrapper').innerHTML;

			let delete_post_html = '';

			if(session_id === post.user_id){
				delete_post_html = '<button class="remove-btn" onclick="removeMyPost(this)">Remove</button>';
			}

			document.querySelector('#allPostsWrapper').innerHTML =`<div class="single-post ${user.username}" data-post_id="${post.id}">
																	<div class="post-content">${post.content}</div>
																	
																	<div class="post-actions">
																		<p><b>Autor: </b>${user.username}</p>
																		<div>
																			<button onclick="likePost(this)" class="likePostJs like-btn"><span>${post.likes}</span> Likes</button>
																			<button class="comment-btn" onclick="commentPost(this)">Comments</button>
																			${delete_post_html}
																		</div>
																	</div>

																	<div class="post-comments">
																		<form>
																			<input placeholder="Napisi komentar..." type="text">
																			<button onclick="commentPostSubmit(event)">Comment</button>
																		</form>
																		${comments_html}
																	</div>
																</div>` + html;
		
		}
		getPostUser();

	});
}
getAllPosts();

document.querySelector('#chooseOption').addEventListener('change', e => {
	let val = document.querySelector('#chooseOption').value;
	let postovi = document.querySelectorAll('.single-post');

	postovi.forEach(e =>{
		e.style.display = 'block';
	});

	postovi.forEach(e =>{
		if(val === 'izaberi'){
			e.style.display = 'block';
		} else{
			if(e.className !== `single-post ${val}`){
				e.style.display = 'none';
			}
		}
	});
});

function search() {
	let input = document.querySelector('#inputSearch');
	input = input.value.toUpperCase();
	let srcString = document.querySelectorAll('.post-content');
	srcString.forEach(e => {
		txtValue = e.textContent || e.innerText;
		if(txtValue.toUpperCase().indexOf(input) > -1){
			let a = e.parentElement;
			a.style.display = 'block';
		} else{
			let a = e.parentElement;
			a.style.display = 'none';
		}
	});
}


const commentPostSubmit = e => {
	e.preventDefault();

	let btn = e.target;
	btn.setAttribute('disabled','true');

	let main_post_el = btn.closest('.single-post');
	let post_id = main_post_el.getAttribute('data-post_id');

	let user = new User();
	user.username = document.querySelector('#korisnicko_ime').value;

	let comment_value = main_post_el.querySelector('input').value;
	main_post_el.querySelector('.post-comments').innerHTML += `<div class="single-post"><b>${user.username}: </b>${comment_value}</div>`;

	main_post_el.querySelector('input').value = '';

	
	let comment = new Comment();
	comment.content = comment_value;
	comment.user_id = session_id;
	comment.post_id = post_id;
	comment.username = username.innerText;
	comment.create();
}

const removeMyPost = btn => {
	let post_id = btn.closest('.single-post').getAttribute('data-post_id');

	btn.closest('.single-post').remove();

	let post = new Post();
	post.delete(post_id);

}

const likePost = btn => {
	let main_post_el = btn.closest('.single-post');
	let post_id = btn.closest('.single-post').getAttribute('data-post_id');
	let number_of_likes = parseInt(btn.querySelector('span').innerText);
	btn.querySelector('span').innerText = number_of_likes + 1;
	btn.setAttribute('disabled','true');

	let post = new Post();
	post.like(post_id,number_of_likes + 1);
}

const commentPost = btn => {
	let main_post_el = btn.closest('.single-post');
	let post_id = main_post_el.getAttribute('data-post_id');

	main_post_el.querySelector('.post-comments').style.display = 'block';
}
