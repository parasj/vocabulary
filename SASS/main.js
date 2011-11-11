		    var App = new Ext.Application({
				name: 'ractive',
				useLoadMask: true,
		        launch: function() {
					// Define Model for Flashcard
					Ext.regModel('Flashcard', {
						idProperty: 'id',
						fields: [
							{ name: 'id', type: 'int' },
							{ name: 'word', type: 'string' },
							{ name: 'def', type: 'string' },
							{ name: 'tries', type: 'int' },
							{ name: 'correct', type: 'int' }
						],
						validations: [
							{ type: 'presence', field: 'id' },
							{ type: 'presence', field: 'word', message: 'Please enter the word for this flashcard.' },
							{ type: 'presence', field: 'def', message: 'Please enter the definition for this flashcard.' },
						]
					});
					
					// Define HTML5 Data Store
					store: new Ext.regStore('FlashcardsStore', {
						model: 'Flashcard',
						sorters: [{
							property: 'word',
							direction: 'ASC'
						}],
						proxy: {
							type: 'localstorage',
							id: 'notes-app-localstore'
						},
						getGroupString: function (record) {
							if (record && record.data.word) {
								return record.get('word')[0];
							} else {
								return '';
							}
						}
					});
					
					// Build List
					var flashcardList = new Ext.List({
						id: 'flashcardList',
						store: 'FlashcardsStore',
						grouped: true,
						indexBar: true,
						itemTpl: '<div class="list-item-word">{word}</div>'+'<div class="list-item-def">{def}</div>',
						onItemDisclosure: function (record) {
							var selectedNote = record;
							flashcardEditor.load(selectedNote);
							viewport.setActiveItem('flashcardEditor', { type: 'slide', direction: 'left' });
    					},
						listeners: {
							'render': function (thisComponent) {
								thisComponent.getStore().load();
							}
						}
					});
					
					// INIT VIEWPORTS
					
					flashcardEditorTopToolbar = new Ext.Toolbar({
						title: 'Edit Flashcard',
						items: [
							{
								text: 'Home',
								ui: 'back',
								handler: function () {
									viewport.setActiveItem('flashcardListContainer', {type: 'slide', direction: 'right'});
								}
							},
							{ xtype: 'spacer' },
							{
								text: 'Save',
								ui: 'action',
								handler: function () {
									var currentFlashcard = flashcardEditor.getRecord();
									flashcardEditor.updateRecord(currentFlashcard);
									var errors = currentFlashcard.validate();
									var errors = currentFlashcard.validate();
									if (!errors.isValid()) {
										Ext.Msg.alert('Required Field Empty!');
										return;
									}
					
									var flashcardStore = Ext.getStore('FlashcardsStore');
					
									if (flashcardStore.findRecord('id', currentFlashcard.data.id) === null) {
										flashcardStore.add(currentFlashcard);
									} else {
										currentFlashcard.setDirty();
									}
					
									flashcardStore.sync();
					  				flashcardStore.sort([{ property: 'word', direction: 'ASC'}]);
					
									flashcardList.refresh();
									
									viewport.setActiveItem('flashcardListContainer', {type: 'slide', direction: 'right'});
								}
							}
						]
					});
					
					flashcardEditorBottomToolbar = new Ext.Toolbar({
						dock: 'bottom',
						items: [
							{ xtype: 'spacer' },
							{
								iconCls: 'trash',
								ui: 'action',
								iconMask: true,
								//text: 'Delete',
								handler: function () {
									var currentFlashcard = flashcardEditor.getRecord();
									var flashcardStore = Ext.getStore('FlashcardsStore');
					
									if (flashcardStore.findRecord('id', currentFlashcard.data.id)) {
										flashcardStore.remove(currentFlashcard);
									}
									
									flashcardStore.sync();
									flashcardStore.sort([{ property: 'name', direction: 'ASC'}]);
									flashcardList.refresh();
									viewport.setActiveItem('flashcardListContainer', { type: 'slide', direction: 'right' });
								}
							}
						]
					});
					
					flashcardEditor = new Ext.form.FormPanel({
						id: 'flashcardEditor',
						items: [
							{
								xtype: 'textfield',
								name: 'word',
								label: 'Word',
								required: true
							},
							{
								xtype: 'textareafield',
								name: 'def',
								label: 'Definition',
								required: true
							}
						],
						dockedItems: [flashcardEditorTopToolbar, flashcardEditorBottomToolbar]
					});
					
					var cardToolbar = new Ext.Toolbar({
						dock : 'top',
						title: 'Radioactive',
						items: [
							{
								id: 'launchFlashcardGame',
								text: 'Learn',
								ui: 'action',
								handler: function () {
									viewport.setActiveItem('flashcardGame', {type: 'slide', direction: 'left'});
								}
							},
							{ xtype: 'spacer' },
							{
								id: 'addFlashcardButton',
								iconCls: 'add',
								iconMask: true,
								ui: 'action',
								handler: function () {
									// TODO: Create a blank note and make the note editor visible.
									var store = Ext.getStore('FlashcardsStore'), num = store.getCount()+1;
					                var flashcard = Ext.ModelMgr.create({ id: num, word: '', def: '' },'Flashcard');
									flashcardEditor.load(flashcard);
									viewport.setActiveItem('flashcardEditor', {type: 'slide', direction: 'left'});
								}
							}
						]
					});
					var flashcardListContainer = new Ext.Panel({
						id: 'flashcardListContainer',
						layout : 'fit',
						dockedItems: [cardToolbar],
						items: [flashcardList]
					});
					var viewport = new Ext.Panel({
						fullscreen: true,
						layout: 'card',
						cardAnimation: 'slide',
						items: [flashcardListContainer, flashcardEditor]
					});
				}
			});