let tinyMCEInstance = null

function initTinyMCE(
  selector = 'textarea#documentContent',
  initialContent = '',
  height = 600
) {
  if (typeof tinymce === 'undefined') {
    console.error('TinyMCE is not loaded')
    return null
  }

  if (tinyMCEInstance) {
    tinymce.remove(selector)
  }

  const config = {
    selector: selector,
    license_key: 'gpl',
    plugins: 'lists link image table code help wordcount',
    height: height,
    menubar: true,
    toolbar:
      'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image | code',
    content_style: 'body { font-family: Arial, sans-serif; font-size: 14px; }',
    promotion: false,
    branding: false,
    /* enable title field in the Image dialog*/
    image_title: true,
    /* enable automatic uploads of images represented by blob or data URIs*/
    automatic_uploads: true,
    /*
    URL of our upload handler (for more details check: https://www.tiny.cloud/docs/configure/file-image-upload/#images_upload_url)
    images_upload_url: 'postAcceptor.php',
    here we add custom filepicker only to Image dialog
  */
    file_picker_types: 'image',
    /* and here's our custom image picker*/
    file_picker_callback: (cb, value, meta) => {
      const input = document.createElement('input')
      input.setAttribute('type', 'file')
      input.setAttribute('accept', 'image/*')

      input.addEventListener('change', (e) => {
        const file = e.target.files[0]

        const reader = new FileReader()
        reader.addEventListener('load', () => {
          /*
          Note: Now we need to register the blob in TinyMCEs image blob
          registry. In the next release this part hopefully won't be
          necessary, as we are looking to handle it internally.
        */
          const id = 'blobid' + new Date().getTime()
          const blobCache = tinymce.activeEditor.editorUpload.blobCache
          const base64 = reader.result.split(',')[1]
          const blobInfo = blobCache.create(id, file, base64)
          blobCache.add(blobInfo)

          /* call the callback and populate the Title field with the file name */
          cb(blobInfo.blobUri(), { title: file.name })
        })
        reader.readAsDataURL(file)
      })

      input.click()
    }
  }

  if (initialContent) {
    config.setup = function (editor) {
      editor.on('init', function () {
        editor.setContent(initialContent)
      })
    }
  }

  tinyMCEInstance = tinymce.init(config)

  return tinyMCEInstance
}

function destroyTinyMCE(selector = 'textarea#documentContent') {
  if (typeof tinymce !== 'undefined' && tinymce.get(selector)) {
    tinymce.remove(selector)
    tinyMCEInstance = null
  }
}

function getTinyMCEContent(selector = 'textarea#documentContent') {
  let content = ''

  if (typeof tinymce !== 'undefined') {
    try {
      const editor = tinymce.get(selector)
      if (editor) {
        content = editor.getContent()
        if (content && content.trim()) {
          return content
        }
      }

      const editorById = tinymce.get('documentContent')
      if (editorById) {
        content = editorById.getContent()
        if (content && content.trim()) {
          return content
        }
      }
    } catch (e) {
      console.warn('Error getting TinyMCE content:', e)
    }
  }

  const textarea = document.querySelector(selector)
  if (textarea) {
    content = textarea.value || ''
    if (content.trim()) {
      return content
    }
  }

  const textareaById = document.getElementById('documentContent')
  if (textareaById) {
    content = textareaById.value || ''
    if (content.trim()) {
      return content
    }
  }

  return content || ''
}

function setTinyMCEContent(selector = 'textarea#documentContent', content) {
  if (typeof tinymce === 'undefined') {
    const textarea = document.querySelector(selector)
    if (textarea) {
      textarea.value = content || ''
    }
    return
  }
  const editor = tinymce.get(selector)
  if (editor) {
    editor.setContent(content || '')
  }
}
