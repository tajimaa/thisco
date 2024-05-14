let preview = document.querySelector("#preview");
document.querySelector('#imageInput').addEventListener('change', function(event) {
	const file = event.target.files[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = function(e) {
			const img = document.querySelector('#cropper-tgt');
			img.src = e.target.result;
			const cropper = new Cropper(img, {
				aspectRatio: 1 / 1,
				dragMode: 'move',
				autoCropArea: 1,
				cropBoxResizable: false,
				cropBoxMovable: false,
				ready: function() {
					cropper.setCropBoxData({
						width: 300,
						height: 300
					});
				},
			});

			document.querySelector('#cropButton').addEventListener('click', function() {
				const editedImageData = cropper.getCroppedCanvas().toDataURL('image/jpeg');
				document.querySelector('#editedImageField').value = editedImageData;
				preview.src = editedImageData;
			});
		};
	reader.readAsDataURL(file);
	}
});

	var form = document.forms[0];
	form.onsubmit = function() {
	    // エラーメッセージをクリアする
	    form.password.setCustomValidity("");
	    // パスワードの一致確認
	    if (form.password.value != form.confirm.value) {
	      // 一致していなかったら、エラーメッセージを表示する
	      form.password.setCustomValidity("パスワードと確認用パスワードが一致しません");
		}
  	};