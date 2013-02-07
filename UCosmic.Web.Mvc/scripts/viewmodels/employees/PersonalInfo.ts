/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../jquery/jqueryui-1.9.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../kendo/kendouiweb.d.ts" />
/// <reference path="../../datacontext/iemployee.ts" />
/// <reference path="../../app/Routes.ts" />

module ViewModels.Employee {

	export class PersonalInfo {

		private _dataContext: DataContext.IEmployee;

		private _revisionId: number;
		GetRevisionId(): number { return this._revisionId; }
		SetRevisionId(inValue: number): void { this._revisionId = inValue; }

		private _isActive: KnockoutObservableBool = ko.observable();
		GetIsActive(): bool { return this._isActive(); }
		SetIsActive(inValue: bool): void { this._isActive(inValue); }

		private _isDisplayNameDerived: KnockoutObservableBool = ko.observable();
		GetIsDisplayNameDerived(): bool { return this._isDisplayNameDerived(); }
		SetIsDisplayNameDerived(inValue: bool): void { this._isDisplayNameDerived(inValue); }

		private _displayName: KnockoutObservableString = ko.observable();
		GetDisplayName(): string { return this._displayName(); }
		SetDisplayName(inValue: string): void { this._displayName(inValue); }

		private _salutations: KnockoutObservableArray = ko.observableArray();
		GetSalutations(): any[] { return this._salutations(); }
		SetSalutations(inValue: any[]): void { this._salutations(inValue); }
		Salutations_Add(inSalutation: string): void { this._salutations.push(inSalutation); }

		private _salutation: KnockoutObservableString = ko.observable();
		GetSalutation(): string { return this._salutation(); }
		SetSalutation(inValue: string): void { this._salutation(inValue); }

		private _firstName: KnockoutObservableString = ko.observable();
		GetFirstName(): string { return this._firstName(); }
		SetFirstName(inValue: string): void { this._firstName(inValue); }

		private _firstNameSubscription: KnockoutSubscription = null;

		private _middleName: KnockoutObservableString = ko.observable();
		GetMiddleName(): string { return this._middleName(); }
		SetMiddleName(inValue: string): void { this._middleName(inValue); }

		private _lastName: KnockoutObservableString = ko.observable();
		GetLastName(): string { return this._lastName(); }
		SetLastName(inValue: string): void { this._lastName(inValue); }

		private _lastNameSubscription: KnockoutSubscription = null;

		private _suffixes: KnockoutObservableArray = ko.observableArray();
		GetSuffixes(): any[] { return this._suffixes(); }
		SetSuffixes(inValue: any[]): void { this._suffixes(inValue); }
		Suffixes_Add(inSuffix: string): void { this._suffixes.push(inSuffix); }

		private _suffix: KnockoutObservableString = ko.observable();
		GetSuffix(): string { return this._suffix(); }
		SetSuffix(inValue: string): void { this._suffix(inValue); }

		private _workingTitle: KnockoutObservableString = ko.observable();
		GetWorkingTitle(): string { return this._workingTitle(); }
		SetWorkingTitle(inValue: string): void { this._workingTitle(inValue); }

		private _gender: KnockoutObservableString = ko.observable();
		GetGender(): string { return this._gender(); }
		SetGender(inValue: string): void { this._gender(inValue); }

		private _facultyRanks: KnockoutObservableArray = ko.observableArray();
		GetFacultyRanks(): any[] { return this._facultyRanks(); }
		SetFacultyRanks(inValue: any[]): void { this._facultyRanks(inValue); }
		FacultyRanks_Add(inRank: any): void { this._facultyRanks.push(inRank); }

		private _facultyRank: KnockoutObservableAny = ko.observable();
		GetFacultyRank(): any { return this._facultyRank(); }
		SetFacultyRank(inValue: any): void { this._facultyRank(inValue); }

		private _administrativeAppointments: KnockoutObservableString = ko.observable();
		GetAdministrativeAppointments(): string { return this._administrativeAppointments(); }
		SetAdministrativeAppointments(inValue: string): void { this._administrativeAppointments(inValue); }

		private _picture: KnockoutObservableAny = ko.observable();
		GetPicture(): any { return this._picture(); }
		SetPicture(inValue: any): void { this._picture(inValue); }

		$facultyRanks: KnockoutObservableJQuery = ko.observable();
		$nameSalutation: KnockoutObservableJQuery = ko.observable();
		$nameSuffix: KnockoutObservableJQuery = ko.observable();

		// --------------------------------------------------------------------------------
		/*
		*/
		// --------------------------------------------------------------------------------
		private _initialize(inDocumentElementId: String) {
			//var me = this; // not necessary if you use arrow functions

			/* We are going to start two asynch processes. One to load salutations and the other
			 * to load the faculty ranks.  We will then wait for both before continuing.
			 */

			var getSalutationsPact: JQueryPromise = this._dataContext.GetSalutations();
			getSalutationsPact.then(
			/* Success */
			(salutations: any): void => {
				for (var i = 0; i < salutations.length; i += 1) {
					this.Salutations_Add(<string>salutations[i]);
				}
			},
			/* Fail */
			(error: any): void => {
			});

			var getSuffixesPact: JQueryPromise = this._dataContext.GetSuffixes();
			getSuffixesPact.then(
			/* Success */
			(suffixes: any): void => {
				for (var i = 0; i < suffixes.length; i += 1) {
					this.Suffixes_Add(<string>suffixes[i]);
				}
			},
			/* Fail */
			(error: any): void => {
			});
			
			var getFacultyRanksPact = this._dataContext.GetFacultyRanks();
			getFacultyRanksPact.then(
			/* Success */
			(facultyRanks: any): void => {
				for (var i = 0; i < facultyRanks.length; i += 1) {
					this.FacultyRanks_Add(facultyRanks[i]);
				}
			},
			/* Fail */
			(error: any): void => {
			});

			// Wait for all loading of selector options before continuing.
			$.when(getSalutationsPact, getSuffixesPact, getFacultyRanksPact)
					.then( /* Continue once selector data has been loaded */
							/* Success (selector data)*/
							(data: any): void => {
								this._dataContext.Get()
									.then( /* Load the viewmodel and apply bindings. */
										/* Success (load viewmodel data)*/
										(data: any): void => {
											this.ToViewModel(this, data);
											ko.applyBindings(this, $("#" + inDocumentElementId).get(0));

                                            // turn faculty ranks dropdown into kendoui widget
                                            // can only happen after applyBindings AND
                                            // options are downloaded from server
			                                this.$facultyRanks().kendoDropDownList();
										},
										/* Fail (load viewmodel data)*/
										(data: any): void => {
										});
							},
								/* Fail (selector data)*/
							function (data: any): void { }
						);
		}

		// --------------------------------------------------------------------------------
		/*
		*/
		// --------------------------------------------------------------------------------
		constructor(inDocumentElementId: String, inDataContext: DataContext.IEmployee) {
			this._dataContext = inDataContext;
			this._initialize(inDocumentElementId);

            // comboboxes for salutation & suffix
			this.$nameSalutation.subscribe((newValue: JQuery): void => {
			    if (newValue && newValue.length)
			        newValue.kendoComboBox({
                        dataTextField: "text",
                        dataValueField: "value",
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: {
                                    url: App.Routes.WebApi.People.Names.Salutations.get()
                                }
                            }
                        })
                    });
            });
			this.$nameSuffix.subscribe((newValue: JQuery): void => {
			    if (newValue && newValue.length)
			        newValue.kendoComboBox({
                        dataTextField: "text",
                        dataValueField: "value",
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: {
                                    url: App.Routes.WebApi.People.Names.Suffixes.get()
                                }
                            }
                        })
                    });
            });
		}

		// --------------------------------------------------------------------------------
		/*
				Map data returned from data context to the view model.
		*/
		// --------------------------------------------------------------------------------
		ToViewModel(inSelf: any, data: any): void {
			var me: PersonalInfo = inSelf;

			me.SetRevisionId(data.revisionId);
			me.SetIsActive(<bool>data.isActive);
			me.SetIsDisplayNameDerived(<bool>data.isDisplayNameDerived);
			me.SetDisplayName((data.displayName != null) ? data.displayName : "");
			me.SetSalutation((data.salutation != null) ? data.salutation : "");
			me.SetFirstName((data.firstName != null) ? data.firstName : "");
			me.SetMiddleName((data.middleName != null) ? data.middleName : "");
			me.SetLastName((data.lastName != null) ? data.lastName : "");
			me.SetSuffix((data.suffix != null) ? data.suffix : "");
			me.SetWorkingTitle((data.workingTitle != null) ? data.workingTitle : "");
			me.SetGender(data.gender);
			if (data.employeeFacultyRank != null) {
				var i: number = 0;
				while ((i < me.GetFacultyRanks().length) && (me.GetFacultyRanks()[i].id != data.employeeFacultyRank.id))
					{ i += 1; }

				if (i < me.GetFacultyRanks().length) {
					me.SetFacultyRank(me.GetFacultyRanks()[i]);
				}
			}
			else {
				me.SetFacultyRank(null);
			}
			me.SetAdministrativeAppointments((data.administrativeAppointments != null) ? data.administrativeAppointments : "");
			me.SetPicture(data.picture);
		}

		// --------------------------------------------------------------------------------
		/*
				Return an object for data context.
		*/
		// --------------------------------------------------------------------------------
		FromViewModel(inSelf: any): any {
			var me: PersonalInfo = inSelf;

			return {
				revisionId: me.GetRevisionId(),
				isActive: me.GetIsActive(),
				isDisplayNameDerived: me.GetIsDisplayNameDerived(),
				displayName: (me.GetDisplayName().length > 0) ? me.GetDisplayName() : null,
				salutation: (me.GetSalutation().length > 0) ? me.GetSalutation() : null,
				firstName: (me.GetFirstName().length > 0) ? me.GetFirstName() : null,
				middleName: (me.GetMiddleName().length > 0) ? me.GetMiddleName() : null,
				lastName: (me.GetLastName().length > 0) ? me.GetLastName() : null,
				suffix: (me.GetSuffix().length > 0) ? me.GetSuffix() : null,
				workingTitle: me.GetWorkingTitle(),
				gender: me.GetGender(),
				employeeFacultyRank: (me.GetFacultyRank() != null) ?
					{ id: me.GetFacultyRank().id, rank: me.GetFacultyRank().rank } :
					null,
				administrativeAppointments: (me.GetAdministrativeAppointments().length > 0) ? me.GetAdministrativeAppointments() : null,
				picture: me.GetPicture()
			};
		}

		// --------------------------------------------------------------------------------
		/*
		*/
		// --------------------------------------------------------------------------------
		saveInfo(formElement: HTMLFormElement): void {
			this.DeriveDisplayName();
			this._dataContext.Put(this.FromViewModel(this))
					.then(  /* Success */ function (data: any): void { },
									/* Fail */ function (errorThrown: string): void { });

			$("#accordion").accordion('activate', 1);	// Open next panel
		}

		// --------------------------------------------------------------------------------
		/*
		*/
		// --------------------------------------------------------------------------------
		saveEmails(formElement: HTMLFormElement): void {
			$("#accordion").accordion('activate', 2);	// Open next panel
		}

		// --------------------------------------------------------------------------------
		/*
		*/
		// --------------------------------------------------------------------------------
		saveAffiliations(formElement: HTMLFormElement): void {
			$("#accordion").accordion('activate', 3);	// Open next panel
		}


		// --------------------------------------------------------------------------------
		/*
		*/
		// --------------------------------------------------------------------------------
		savePicture(formElement: HTMLFormElement): void {
			$("#accordion").accordion('activate', 0);	// Open next panel
		}

		// --------------------------------------------------------------------------------
		/*
		*/
		// --------------------------------------------------------------------------------
		derivedNameClickHandler(model: PersonalInfo, event: any): bool {
			if (model.GetIsDisplayNameDerived()) {
				$("#displayName").attr("disabled", "disabled");
				model._firstNameSubscription = model._firstName.subscribe(function (inValue: any): void { model.DeriveDisplayName(model); });
				model._lastNameSubscription = model._lastName.subscribe(function (inValue: any): void { model.DeriveDisplayName(model); });
				model.DeriveDisplayName(model);
			}
			else {
				$("#displayName").removeAttr("disabled");
				model._firstNameSubscription.dispose();
				model._lastNameSubscription.dispose();
			}

			return true; // let default click action proceed
		}

		// --------------------------------------------------------------------------------
		/*
		*/
		// --------------------------------------------------------------------------------
		DeriveDisplayName(inModel?: PersonalInfo): void {
			var me = (inModel != null) ? inModel : this;
			me.SetDisplayName(me.GetFirstName() + " " + me.GetLastName());
		}

	} // class PersonalInfo

}

