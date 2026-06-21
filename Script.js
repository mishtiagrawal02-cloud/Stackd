// (() => {
//   const { PDFDocument } = window.PDFLib;
 
//   const dropzone = document.getElementById('dropzone');
//   const fileInput = document.getElementById('file-input');
//   const stackSection = document.getElementById('stackSection');
//   const sheetList = document.getElementById('sheetList');
//   const stackMeta = document.getElementById('stackMeta');
//   const mergeBtn = document.getElementById('mergeBtn');
//   const stampHint = document.getElementById('stampHint');
//   const errorMsg = document.getElementById('errorMsg');
//   const resultSection = document.getElementById('resultSection');
//   const resultTitle = document.getElementById('resultTitle');
//   const resultMeta = document.getElementById('resultMeta');
//   const downloadLink = document.getElementById('downloadLink');
//   const resetBtn = document.getElementById('resetBtn');
//   const mergeBtnLabel = document.getElementById('mergeBtnLabel');
 
//   const COLORS = ['blue', 'pink', 'canary', 'white'];
//   let sheets = []; // { id, file, color, pageCount }
//   let dragId = null;
 
//   function uid() {
//     return Math.random().toString(36).slice(2, 10);
//   }
 
//   function formatBytes(bytes) {
//     if (bytes < 1024) return bytes + ' B';
//     if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
//     return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
//   }
 
//   function showError(msg) {
//     errorMsg.textContent = msg;
//     errorMsg.hidden = false;
//   }
 
//   function clearError() {
//     errorMsg.hidden = true;
//     errorMsg.textContent = '';
//   }
 
//   function isPdf(file) {
//     return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
//   }
 
//   async function addFiles(fileListLike) {
//     clearError();
//     const files = Array.from(fileListLike);
//     if (!files.length) return;
 
//     const rejected = [];
//     for (const file of files) {
//       if (!isPdf(file)) {
//         rejected.push(file.name);
//         continue;
//       }
//       const entry = {
//         id: uid(),
//         file,
//         color: COLORS[sheets.length % COLORS.length],
//         pageCount: null,
//       };
//       sheets.push(entry);
//       render();
//       try {
//         const bytes = await file.arrayBuffer();
//         const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
//         entry.pageCount = doc.getPageCount();
//       } catch (err) {
//         entry.pageCount = '?';
//         entry.loadError = true;
//       }
//       render();
//     }
 
//     if (rejected.length) {
//       showError(
//         rejected.length === 1
//           ? `"${rejected[0]}" isn't a PDF — only .pdf files can join the stack.`
//           : `${rejected.length} files weren't PDFs and were skipped.`
//       );
//     }
//   }
 
//   function removeSheet(id) {
//     sheets = sheets.filter((s) => s.id !== id);
//     render();
//   }
 
//   function render() {
//     stackSection.hidden = sheets.length === 0;
//     sheetList.innerHTML = '';
 
//     sheets.forEach((s) => {
//       const li = document.createElement('li');
//       li.className = 'sheet';
//       li.draggable = true;
//       li.dataset.id = s.id;
//       li.dataset.color = s.color;
 
//       const pages =
//         s.pageCount === null ? 'reading…' : s.loadError ? 'could not read pages' : `${s.pageCount} page${s.pageCount === 1 ? '' : 's'}`;
 
//       li.innerHTML = `
//         <span class="sheet-handle" aria-hidden="true">&#8942;&#8942;</span>
//         <div class="sheet-info">
//           <p class="sheet-name">${escapeHtml(s.file.name)}</p>
//           <p class="sheet-sub">${pages} &middot; ${formatBytes(s.file.size)}</p>
//         </div>
//         <button class="sheet-remove" aria-label="Remove ${escapeHtml(s.file.name)}">&times;</button>
//       `;
 
//       li.querySelector('.sheet-remove').addEventListener('click', () => removeSheet(s.id));
 
//       li.addEventListener('dragstart', () => {
//         dragId = s.id;
//         li.classList.add('is-dragging');
//       });
//       li.addEventListener('dragend', () => {
//         li.classList.remove('is-dragging');
//         document.querySelectorAll('.sheet').forEach((el) => el.classList.remove('drag-over'));
//       });
//       li.addEventListener('dragover', (e) => {
//         e.preventDefault();
//         if (s.id !== dragId) li.classList.add('drag-over');
//       });
//       li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
//       li.addEventListener('drop', (e) => {
//         e.preventDefault();
//         li.classList.remove('drag-over');
//         if (dragId === null || dragId === s.id) return;
//         const fromIdx = sheets.findIndex((x) => x.id === dragId);
//         const toIdx = sheets.findIndex((x) => x.id === s.id);
//         const [moved] = sheets.splice(fromIdx, 1);
//         sheets.splice(toIdx, 0, moved);
//         dragId = null;
//         render();
//       });
 
//       sheetList.appendChild(li);
//     });
 
//     const totalPages = sheets.reduce((sum, s) => sum + (typeof s.pageCount === 'number' ? s.pageCount : 0), 0);
//     stackMeta.textContent = `${sheets.length} file${sheets.length === 1 ? '' : 's'} \u00b7 ${totalPages} page${totalPages === 1 ? '' : 's'}`;
 
//     const ready = sheets.length >= 2 && sheets.every((s) => typeof s.pageCount === 'number');
//     mergeBtn.disabled = !ready;
//     stampHint.textContent =
//       sheets.length < 2 ? 'Add at least 2 PDFs to merge' : ready ? '' : 'Reading files\u2026';
//   }
 
//   function escapeHtml(str) {
//     const div = document.createElement('div');
//     div.textContent = str;
//     return div.innerHTML;
//   }
 
//   async function mergeStack() {
//     clearError();
//     mergeBtn.disabled = true;
//     mergeBtnLabel.textContent = 'Merging\u2026';
 
//     try {
//       const merged = await PDFDocument.create();
//       for (const s of sheets) {
//         const bytes = await s.file.arrayBuffer();
//         const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
//         const pages = await merged.copyPages(doc, doc.getPageIndices());
//         pages.forEach((p) => merged.addPage(p));
//       }
//       const mergedBytes = await merged.save();
//       const blob = new Blob([mergedBytes], { type: 'application/pdf' });
//       const url = URL.createObjectURL(blob);
 
//       const filename = `merged-${sheets.length}-files.pdf`;
//       downloadLink.href = url;
//       downloadLink.download = filename;
//       resultTitle.textContent = filename;
//       resultMeta.textContent = `${merged.getPageCount()} pages \u00b7 ${formatBytes(blob.size)}`;
 
//       stackSection.hidden = true;
//       resultSection.hidden = false;
//       resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     } catch (err) {
//       showError("Couldn't merge \u2014 one of these PDFs may be corrupted or password protected. Try removing it and merging again.");
//     } finally {
//       mergeBtnLabel.textContent = 'Merge stack';
//       render();
//     }
//   }
 
//   function reset() {
//     sheets = [];
//     dragId = null;
//     fileInput.value = '';
//     resultSection.hidden = true;
//     clearError();
//     render();
//     dropzone.scrollIntoView({ behavior: 'smooth', block: 'start' });
//   }
 
//   // --- wiring ---
 
//   fileInput.addEventListener('change', (e) => addFiles(e.target.files));
 
//   ['dragenter', 'dragover'].forEach((evt) =>
//     dropzone.addEventListener(evt, (e) => {
//       e.preventDefault();
//       dropzone.classList.add('is-dragover');
//     })
//   );
//   ['dragleave', 'drop'].forEach((evt) =>
//     dropzone.addEventListener(evt, (e) => {
//       e.preventDefault();
//       dropzone.classList.remove('is-dragover');
//     })
//   );
//   dropzone.addEventListener('drop', (e) => {
//     if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
//   });
 
//   mergeBtn.addEventListener('click', mergeStack);
//   resetBtn.addEventListener('click', reset);
 
//   render();
// })();
 
(() => {
  const { PDFDocument } = window.PDFLib;
 
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const stackSection = document.getElementById('stackSection');
  const sheetList = document.getElementById('sheetList');
  const stackMeta = document.getElementById('stackMeta');
  const mergeBtn = document.getElementById('mergeBtn');
  const stampHint = document.getElementById('stampHint');
  const errorMsg = document.getElementById('errorMsg');
  const resultSection = document.getElementById('resultSection');
  const resultTitle = document.getElementById('resultTitle');
  const resultMeta = document.getElementById('resultMeta');
  const downloadLink = document.getElementById('downloadLink');
  const resetBtn = document.getElementById('resetBtn');
  const mergeBtnLabel = document.getElementById('mergeBtnLabel');
 
  const COLORS = ['blue', 'pink', 'canary', 'white'];
 
  // Each entry in `blocks` is a PAGE RANGE from a source file, not a whole
  // file. Splitting a file produces two blocks that can be dragged
  // independently — that's what lets a second file be inserted partway
  // through the first one instead of only after it.
  // { id, file, color, totalPages, startPage, endPage, loadError, splitOpen }
  let blocks = [];
  let dragId = null;
 
  function uid() {
    return Math.random().toString(36).slice(2, 10);
  }
 
  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
 
  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.hidden = false;
  }
 
  function clearError() {
    errorMsg.hidden = true;
    errorMsg.textContent = '';
  }
 
  function isPdf(file) {
    return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  }
 
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
 
  async function addFiles(fileListLike) {
    clearError();
    const files = Array.from(fileListLike);
    if (!files.length) return;
 
    const rejected = [];
    for (const file of files) {
      if (!isPdf(file)) {
        rejected.push(file.name);
        continue;
      }
      const block = {
        id: uid(),
        file,
        color: COLORS[blocks.length % COLORS.length],
        totalPages: null,
        startPage: 0,
        endPage: 0,
        loadError: false,
        splitOpen: false,
      };
      blocks.push(block);
      render();
      try {
        const bytes = await file.arrayBuffer();
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        block.totalPages = doc.getPageCount();
        block.endPage = block.totalPages - 1;
      } catch (err) {
        block.loadError = true;
      }
      render();
    }
 
    if (rejected.length) {
      showError(
        rejected.length === 1
          ? `"${rejected[0]}" isn't a PDF — only .pdf files can join the stack.`
          : `${rejected.length} files weren't PDFs and were skipped.`
      );
    }
  }
 
  function removeBlock(id) {
    blocks = blocks.filter((b) => b.id !== id);
    render();
  }
 
  function toggleSplit(id, open) {
    const b = blocks.find((x) => x.id === id);
    if (b) b.splitOpen = open;
    render();
  }
 
  // splitAfter is 1-based: "split after page N" — page N stays in the
  // first piece, page N+1 starts the second piece.
  function splitBlock(id, splitAfter1Based) {
    const idx = blocks.findIndex((x) => x.id === id);
    if (idx === -1) return;
    const b = blocks[idx];
    const splitAfter0 = splitAfter1Based - 1; // 0-based last page of first piece
 
    if (splitAfter0 < b.startPage || splitAfter0 >= b.endPage) {
      showError(`Pick a page between ${b.startPage + 2} and ${b.endPage + 1} to split on.`);
      return;
    }
 
    const first = { ...b, id: uid(), endPage: splitAfter0, splitOpen: false };
    const second = { ...b, id: uid(), startPage: splitAfter0 + 1, splitOpen: false };
    blocks.splice(idx, 1, first, second);
    clearError();
    render();
  }
 
  function blockPageCount(b) {
    return b.endPage - b.startPage + 1;
  }
 
  function render() {
    stackSection.hidden = blocks.length === 0;
    sheetList.innerHTML = '';
 
    blocks.forEach((b) => {
      const li = document.createElement('li');
      li.className = 'sheet';
      li.draggable = true;
      li.dataset.id = b.id;
      li.dataset.color = b.color;
 
      let pagesLabel;
      if (b.totalPages === null) {
        pagesLabel = 'reading\u2026';
      } else if (b.loadError) {
        pagesLabel = 'could not read pages';
      } else if (blockPageCount(b) === b.totalPages) {
        pagesLabel = `${b.totalPages} page${b.totalPages === 1 ? '' : 's'}`;
      } else {
        pagesLabel = `pages ${b.startPage + 1}\u2013${b.endPage + 1} of ${b.totalPages}`;
      }
 
      const canSplit = !b.loadError && b.totalPages !== null && blockPageCount(b) > 1;
 
      li.innerHTML = `
        <div class="sheet-row">
          <span class="sheet-handle" aria-hidden="true">&#8942;&#8942;</span>
          <div class="sheet-info">
            <p class="sheet-name">${escapeHtml(b.file.name)}</p>
            <p class="sheet-sub">${pagesLabel} &middot; ${formatBytes(b.file.size)}</p>
          </div>
          <div class="sheet-actions">
            ${canSplit ? `<button class="split-toggle" type="button">Split</button>` : ''}
            <button class="sheet-remove" type="button" aria-label="Remove ${escapeHtml(b.file.name)}">&times;</button>
          </div>
        </div>
        ${
          b.splitOpen
            ? `<div class="split-row">
                <label>Split after page
                  <input type="number" class="split-input" min="${b.startPage + 1}" max="${b.endPage}" value="${Math.floor((b.startPage + b.endPage) / 2) + 1}">
                </label>
                <button class="split-confirm" type="button">Split</button>
                <button class="split-cancel" type="button">Cancel</button>
              </div>`
            : ''
        }
      `;
 
      li.querySelector('.sheet-remove').addEventListener('click', () => removeBlock(b.id));
 
      const splitToggleBtn = li.querySelector('.split-toggle');
      if (splitToggleBtn) {
        splitToggleBtn.addEventListener('click', () => toggleSplit(b.id, true));
      }
 
      const splitCancelBtn = li.querySelector('.split-cancel');
      if (splitCancelBtn) {
        splitCancelBtn.addEventListener('click', () => toggleSplit(b.id, false));
      }
 
      const splitConfirmBtn = li.querySelector('.split-confirm');
      if (splitConfirmBtn) {
        splitConfirmBtn.addEventListener('click', () => {
          const input = li.querySelector('.split-input');
          splitBlock(b.id, parseInt(input.value, 10));
        });
      }
 
      // Reordering is disabled while a split form is open so a stray drag
      // doesn't discard the in-progress split.
      li.draggable = !b.splitOpen;
 
      li.addEventListener('dragstart', () => {
        dragId = b.id;
        li.classList.add('is-dragging');
      });
      li.addEventListener('dragend', () => {
        li.classList.remove('is-dragging');
        document.querySelectorAll('.sheet').forEach((el) => el.classList.remove('drag-over'));
      });
      li.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (b.id !== dragId) li.classList.add('drag-over');
      });
      li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
      li.addEventListener('drop', (e) => {
        e.preventDefault();
        li.classList.remove('drag-over');
        if (dragId === null || dragId === b.id) return;
        const fromIdx = blocks.findIndex((x) => x.id === dragId);
        const toIdx = blocks.findIndex((x) => x.id === b.id);
        const [moved] = blocks.splice(fromIdx, 1);
        blocks.splice(toIdx, 0, moved);
        dragId = null;
        render();
      });
 
      sheetList.appendChild(li);
    });
 
    const totalPages = blocks.reduce((sum, b) => sum + (b.totalPages !== null && !b.loadError ? blockPageCount(b) : 0), 0);
    const fileCount = new Set(blocks.map((b) => b.file)).size;
    stackMeta.textContent = `${fileCount} file${fileCount === 1 ? '' : 's'} \u00b7 ${blocks.length} piece${blocks.length === 1 ? '' : 's'} \u00b7 ${totalPages} page${totalPages === 1 ? '' : 's'}`;
 
    const allRead = blocks.every((b) => b.totalPages !== null);
    const ready = blocks.length >= 2 && allRead;
    mergeBtn.disabled = !ready;
    stampHint.textContent =
      blocks.length < 2
        ? 'Add at least 2 PDFs to merge \u2014 or split one file into pieces to reorder its own pages'
        : ready
        ? ''
        : 'Reading files\u2026';
  }
 
  async function mergeStack() {
    clearError();
    mergeBtn.disabled = true;
    mergeBtnLabel.textContent = 'Merging\u2026';
 
    try {
      const merged = await PDFDocument.create();
      const docCache = new Map(); // avoid re-parsing the same file for multiple split pieces
 
      for (const b of blocks) {
        let doc = docCache.get(b.file);
        if (!doc) {
          const bytes = await b.file.arrayBuffer();
          doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
          docCache.set(b.file, doc);
        }
        const indices = [];
        for (let p = b.startPage; p <= b.endPage; p++) indices.push(p);
        const copied = await merged.copyPages(doc, indices);
        copied.forEach((p) => merged.addPage(p));
      }
 
      const mergedBytes = await merged.save();
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
 
      const fileCount = new Set(blocks.map((b) => b.file)).size;
      const filename = `merged-${fileCount}-files.pdf`;
      downloadLink.href = url;
      downloadLink.download = filename;
      resultTitle.textContent = filename;
      resultMeta.textContent = `${merged.getPageCount()} pages \u00b7 ${formatBytes(blob.size)}`;
 
      stackSection.hidden = true;
      resultSection.hidden = false;
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      showError("Couldn't merge \u2014 one of these PDFs may be corrupted or password protected. Try removing it and merging again.");
    } finally {
      mergeBtnLabel.textContent = 'Merge stack';
      render();
    }
  }
 
  function reset() {
    blocks = [];
    dragId = null;
    fileInput.value = '';
    resultSection.hidden = true;
    clearError();
    render();
    dropzone.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
 
  // --- wiring ---
 
  fileInput.addEventListener('change', (e) => addFiles(e.target.files));
 
  ['dragenter', 'dragover'].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add('is-dragover');
    })
  );
  ['dragleave', 'drop'].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
    })
  );
  dropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  });
 
  mergeBtn.addEventListener('click', mergeStack);
  resetBtn.addEventListener('click', reset);
 
  render();
})();
 