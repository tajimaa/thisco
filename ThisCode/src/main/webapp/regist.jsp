<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">

<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>画像クロップとアップロード</title>
<link rel="stylesheet"
	href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css">
	
	<link rel="icon"  type="image/x-icon" href="resource/user_icons/favicon.ico">

<!-- Required meta tags -->
<meta charset="utf-8">
<meta name="viewport"
	content="width=device-width, initial-scale=1, shrink-to-fit=no">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link
	href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100;200;300;400;500;600;700;800;900&family=Poppins:wght@200;300;400;500;600;900&display=swap"
	rel="stylesheet">
<link
	href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
	rel="stylesheet"
	integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
	crossorigin="anonymous">

<link rel="stylesheet" type="text/css"
	href="${pageContext.request.contextPath}/css/registerpage.css">
</head>

<body>

	<div class="card register_card">
		<div class=" card-title text-center" style="color: #fff;">
			<h3>アカウント作成</h3>
		</div>
		<div class="user_icon_div">
			<img id='preview' class="user_icon" src="${pageContext.request.contextPath}/resource/user_icons/default2.png">
			<div class="edit_icon">
				<button type="button" class="btn_edit" data-bs-toggle="modal" data-bs-target="#exampleModal"><i class="fa-solid fa-pen-to-square fa-xl"></i></button>
			</div>
		</div>

		<form id="imageForm" action="fn/register" method="post" enctype="multipart/form-data">
		  <div class="mb-3">
		    <label for="exampleInputEmail1" class="form-label mt-3">メールアドレス</label>
			<span id="miss" class="none mis">- メールアドレスは登録済みです。</span>
		    <input type="email" name="email" class="form-control input_text" id="exampleInputEmail1" aria-describedby="emailHelp" required>
		  </div>
		  <div class="mb-3">
		    <label for="exampleInputPassword1" class="form-label">ユーザー名</label>
		    <input type="text" name="username" class="form-control input_text" required>
		  </div>
		  <div class="mb-3">
		    <label for="exampleInputPassword1" class="form-label">パスワード</label>
		    <input type="password" name="password" class="form-control input_text" id="exampleInputPassword1" required>
		  </div>
		  <div class="mb-3">
		    <label for="exampleInputPassword1" class="form-label">パスワード(確認)</label>
		    <input type="password" name="confirm" class="form-control input_text" id="exampleInputPassword1" required>
		  </div>
		  <div class="mb-3 form-check">
		    <input type="checkbox" class="form-check-input" id="exampleCheck1">
		    <label class="form-check-label" for="exampleCheck1">Check me out</label>
		  </div>
		  <button type="submit" class="btn btn-primary">アップロード</button>
		  <input type="hidden" id="editedImageField" name="editedImage" value="default">
		</form>
		
	</div>
	<div class="modal fade" id="exampleModal" tabindex="-1"
		aria-labelledby="exampleModalLabel" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h1 class="modal-title fs-5" id="exampleModalLabel">ユーザーアイコン</h1>
					<button type="button" class="btn-close" data-bs-dismiss="modal"
						aria-label="Close"></button>
				</div>
				<div class="modal-body">
					<input type="file" id="imageInput" name="image" accept="image/*">
					<div style="width: 300px; height: 300px;">
						<img id="cropper-tgt" style="width: 300px; height: 300px;">
					</div>

				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
					<button type="button" id="cropButton" class="btn btn-primary" data-bs-dismiss="modal">確定</button>
				</div>
			</div>
		</div>
	</div>
	<script src="https://kit.fontawesome.com/c82cac4dcf.js" crossorigin="anonymous"></script>
	<script
		src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js"></script>
	<script src="javascript/register.js"></script>
	<script
		src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
		integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
		crossorigin="anonymous"></script>
</body>
<script>
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has('miss')) {
		document.getElementById('miss').classList.remove('none');
		document.getElementById('misss').classList.remove('none');
		document.getElementById('color').classList.add('mis');
		document.getElementById('colors').classList.add('mis');
    }
</script>

</html>