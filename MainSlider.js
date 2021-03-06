class MainSlider {
  constructor(rootClass) {
    /// zmienne HTML stałe

    // sekcja ograniczająca widoczność slidera (overflow : hidden)
    this.section = document.querySelector(`.${rootClass}`);
    // kontener zawierający slidy
    this.slider = this.section.querySelector(".js__MainSlider");
    // pobrane elementy slidera zgodnie z HTML
    this.startingSliderElements = this.section.querySelectorAll(
      ".js__MainSlider-element"
    );
    // elementy slidera które będą póżniej zmieniane ( append, prepend )
    this.sliderElements = this.section.querySelectorAll(
      ".js__MainSlider-element"
    );

    /// zmienne zdeklarowane ustalajace czy dany element wystepuje w sliderze
    // czas intervalu
    this.intervalTime = null;
    // występowanie strzałki w lewo
    this.arrowLeft = null;
    // występowanie strzałki w prawo
    this.arrowRight = null;
    // występowanie nawigacji slidera
    this.controlPanel = null;
    // rodzaj animacji dla slidera
    this.animation = null;
    this.customChange = null;

    this.focus = null;

    /// ukrywanie obiektów podczas braku eventów wjazdu myszki na slider

    //strzałka w lewo
    this.isHiddenLeft = null;
    //strzałka w prawo
    this.isHiddenRight = null;

    /// zmienne generujące się na podstawie ilości slidów

    // kontrolki do navigacji
    this.controlPanelElements = null;
    this.photoContainer = null;
    // ilość widocznych elementów  w jednym slidzie
    this.amountOfVisibleElements = null;
    // szerokość kontenera z overflow, czyli ograniczającego widocznośc slidów
    this.widthOfVisibleElement = null;
    this.customWidth = 0;

    /// zmienne do których musi mieć dostęp wiele funkcji
    // index wyświetlanego slidera
    this.indexOfShowedSlider = null;
    // cały interval dla slidera
    this.intervalForSlider = null;
    // czas animacji (mnożony razy 1000)
    this.transition = 0.5;
    // index poprzednio kliknietego elementu nawigacji
    this.indexOfLastActiveDot = 0;
    // ostatni index aktywnego slidera
    this.remaindMeLastIndex = this.indexOfShowedSlider;
    // elementy które muszą pozostać skopiowane i wrzucone jako prepend/append
    this.elementsToCopy = [];

    /// flagi

    // czy index został zmieniony przez użytkownika?
    this.indexManualyChanged = false;
    // czy uzytkownik moze ponownie kliknąc w strzałkę ( interval ograniczający bugowanie)
    this.canIClick = true;
    // czy została kliknieta ostatni element nawigacji
    this.lastElementWasClicked = false;
    // czy nawigacja zostala kliknieta
    this.dotClicked = false;

    this.mediaQueryList = window.matchMedia("(orientation: portrait)");

    this.spaceFilled = false;

    /// poczatkowe funcje inicjalizujace slider

    // pobranie indexu rozpoczynającego ( szuka pierwszego elementu z active)
    this.readIndex();
    // ustala początkowe zmienne ( pobierane na podstawie klas / datyset z HTML)
    this.getVariables();
    // dodaje date index w zależnosci od indexu slidera
    this.addDatasetForSliders();
    // rozpoczyna działanie slidera
    this.initSlider();
    this.mediaQuery();

    ///////////////
    this.numberOfItemsToAppend = 0;

    this.indexOfActiveSlide = 0;
  }

  //////////// METODY STARTOWE

  //// metoda czytająca rozpoczynający index
  readIndex = () => {
    this.sliderElements.forEach((sliderElement, index) => {
      if (sliderElement.classList.contains("active")) {
        this.indexOfShowedSlider = index;
      }
    });
  };

  /// metoda pobierająca początkowe zmienne
  getVariables = () => {
    this.intervalTime = this.slider.dataset.interval ?? null;
    this.arrowLeft =
      this.section.querySelector(`.js__MainSlider-arrow--left`) ?? null;
    this.arrowRight =
      this.section.querySelector(`.js__MainSlider-arrow--right`) ?? null;
    this.controlPanel =
      this.section.querySelector(`.js__MainSlider-controler`) ?? null;
    this.isHiddenLeft =
      this.arrowLeft.classList.contains("js__MainSlider-hidden") ?? null;
    this.isHiddenRight =
      this.arrowRight.classList.contains("js__MainSlider-hidden") ?? null;
    this.isHiddenControler =
      this.controlPanel.classList.contains("js__MainSlider-hidden") ?? null;
    this.focus = this.slider.dataset.focus
      ? parseInt(this.slider.dataset.focus)
      : 0;
    this.touches = this.slider.dataset.mobile ?? null;
    this.animation = this.slider.dataset.animate ?? null;
    this.widthOfVisibleElement = this.slider.offsetWidth;
    this.heightOfVisibleElement = this.section.offsetHeight;
    this.customChange = this.slider.dataset.changeslide ?? null;
    this.photoContainer =
      document.querySelector(`[id="${this.section.dataset.photo}"]`) ?? null;
  };

  mediaQuery = () => {
    this.mediaQueryList.addEventListener("change", () => {
      this.resetSlider();
    });
  };
  //// metoda dodająca każdemu sliderowi date index
  addDatasetForSliders = () => {
    this.sliderElements.forEach((sliderElement, index) => {
      sliderElement.dataset.index = index;
    });
  };

  resetSlider = () => {
    clearInterval(this.intervalForSlider);
    this.resetContainer();
    this.sliderElements = this.section.querySelectorAll(
      ".js__MainSlider-element"
    );
    this.readWidthOfVisibleElement();
    this.checkAmountOfElements();
    this.customWidth = 0;
    this.indexOfShowedSlider = 0;
    this.indexOfLastActiveDot = 0;
    this.remaindMeLastIndex = 0;
    this.lastElementWasClicked = false;
    this.removeActiveForAnItems(this.sliderElements);
    this.addActiveForAnItem(this.sliderElements[0]);
    this.addTransition(true);
    this.slider.style.transform = `translateX(0px)`;

    this.controlPanel.innerHTML = "";
    this.createControlPanel(this.amountOfVisibleElements);
    this.removeActiveForAnItems(this.controlPanelElements);
    this.addActiveForAnItem(this.controlPanelElements[0]);

    this.addDatasetForSliders();
    this.groupSliderElements();
    if (this.customChange) {
      this.customCount();
    }
  };
  //// metoda odpalająca funkcje zgodnie z wyzej ustalonymi zmiennymi
  initSlider = () => {
    if (this.photoContainer) {
      this.showPhoto();
      this.showPhotoByClickOnElement();
    }

    if (this.controlPanel) {
      if (!this.photoContainer) {
        this.checkAmountOfElements();
        this.createControlPanel(this.amountOfVisibleElements);
        this.groupSliderElements();

        this.addStartedActive();
      }
    }
    if (this.arrowLeft) {
      this.arrowLeft.addEventListener("click", () => {
        this.indexManualyChanged = true;
        clearInterval(this.intervalForSlider);
        if (this.animation === "fade") {
          this.reduceIndex();
          this.reduceDotIndex();
        }
        if (this.animation === "horizontal") {
          if (this.canIClick) {
            this.canIClick = false;

            this.moveIntoPrevSlide();

            this.readyToClick();

            this.removeActiveForAnItems(this.controlPanelElements);
          }
        }
        if (this.animation === "vertical") {
          if (this.canIClick) {
            this.canIClick = false;
            this.moveIntoPrevSlide();
            this.readyToClick();

            this.removeActiveForAnItems(this.controlPanelElements);
          }
        }
      });
    }
    if (this.arrowRight) {
      this.arrowRight.addEventListener("click", () => {
        this.indexManualyChanged = true;
        clearInterval(this.intervalForSlider);
        if (this.animation === "fade") {
          this.increaseIndex();
        }
        if (this.animation === "horizontal") {
          if (this.canIClick) {
            this.canIClick = false;

            this.moveIntoNextSlide();

            this.readyToClick();

            this.removeActiveForAnItems(this.controlPanelElements);
          }
        }
        if (this.animation === "vertical") {
          if (this.canIClick) {
            this.canIClick = false;
            this.moveIntoNextSlide();
            this.readyToClick();
            if (this.sliderElements.length % this.amountOfVisibleElements) {
              this.removeActiveForAnItems(this.controlPanelElements);
            }
          }
        }
      });
    }
    if (this.isHiddenRight) {
      this.hiddenControl(this.arrowRight);
    }
    if (this.isHiddenLeft) {
      this.hiddenControl(this.arrowLeft);
    }
    if (this.isHiddenControler) {
      this.hiddenControl(this.controlPanel);
    }
    if (this.intervalTime) {
      this.setInterval();
      this.intervalControl();
    }
    if (this.touches) {
      this.controlTouches();
    }
    if (this.animation === "horizontal") {
      this.readWidthOfVisibleElement();
      if (!this.photoContainer) {
        this.addStartedActive();
      }
    }
    if (this.animation === "vertical") {
      this.readHeightOfVisibleElement();
      if (!this.photoContainer) {
        this.addStartedActive();
      }
    }
    if (this.customChange) {
      this.customCount();
    }
  };

  //// metoda dodająca active do elementu nawigacji
  addStartedActive = () => {
    this.controlPanelElements[0].classList.add("active");
  };

  //// metoda która grupuje elementy slidera (data-group)
  groupSliderElements = () => {
    let numberOfGroup = 0;
    let increase = 0;
    this.sliderElements.forEach((sliderElement, index) => {
      if (increase >= this.amountOfVisibleElements) {
        numberOfGroup += 1;
        increase = 0;
      }
      increase++;
      this.sliderElements[index].dataset.group = numberOfGroup;
    });
  };
  //////////// METODY KONTROLUJACE DZIALANIE DANEGO OBIEKTU

  hiddenControl = (elementToHide) => {
    this.section.addEventListener("mouseleave", (e) => {
      elementToHide.classList.remove("active");
    });
    this.section.addEventListener("mouseenter", (e) => {
      elementToHide.classList.add("active");
    });
  };
  intervalControl = () => {
    this.section.addEventListener("mouseleave", (e) => {
      this.setInterval();
    });
    this.section.addEventListener("mouseenter", (e) => {
      clearInterval(this.intervalForSlider);
    });
  };
  controlTouches = () => {
    let touchStart = null;
    let touchEnd = null;
    this.slider.addEventListener("touchstart", (e) => {
      clearInterval(this.intervalForSlider);
      this.indexManualyChanged = true;
      touchStart = e.touches[0].clientX;
    });
    this.slider.addEventListener("touchend", (e) => {
      if (
        e.target.closest(".js__MainSlider-arrow--right") ||
        e.target.closest(".js__MainSlider-arrow--left") ||
        e.target.closest(".js__MainSlider-control-element")
      ) {
        clearInterval(this.intervalForSlider);
        return;
      }
      clearInterval(this.intervalForSlider);
      if (this.animation === "fade") {
        if (touchStart > touchEnd) {
          this.increaseIndex();
        } else {
          this.reduceIndex();
          this.reduceDotIndex();
        }
      }
      if (this.animation === "horizontal" || this.animation === "vertical") {
        this.indexManualyChanged = true;
        clearInterval(this.intervalForSlider);
        if (touchStart > touchEnd) {
          if (this.canIClick) {
            this.canIClick = false;

            this.moveIntoNextSlide();

            this.readyToClick();
            if (this.sliderElements.length % this.amountOfVisibleElements) {
              this.removeActiveForAnItems(this.controlPanelElements);
            }
          }
        } else {
          if (this.canIClick) {
            this.canIClick = false;

            this.moveIntoPrevSlide();

            this.readyToClick();

            this.removeActiveForAnItems(this.controlPanelElements);
          }
        }
      }
      this.setInterval();
    });
    this.slider.addEventListener("touchmove", (e) => {
      touchEnd = e.touches[0].clientX;
    });
  };

  ////////// METODY ZMIENIAJACE ZMIENNE / STYLE / FLAGI

  /// metoda ktora ustala czy slide ma byc zmieniony (canIClick)
  readyToClick = () => {
    setTimeout(() => {
      this.canIClick = true;
    }, this.transition * 1000);
  };
  //// metoda ustalająca poprzedni index slidera
  changeValueOfVariables = () => {
    this.remaindMeLastIndex = this.indexOfShowedSlider;
  };

  /// funkcja dodajaca/odejmujaca transition
  addTransition = (shouldIAdd) => {
    if (shouldIAdd) {
      this.slider.style.transition = `${this.transition}s`;
    } else {
      this.slider.style.transition = "none";
    }
  };

  /// odczytuje szerokosc widocznych sliderów *szerokosc kontenera overflow*
  readWidthOfVisibleElement = () => {
    this.widthOfVisibleElement = this.slider.offsetWidth;
  };

  readHeightOfVisibleElement = () => {
    this.heightOfVisibleElement = this.section.offsetHeight;
  };
  customCount = () => {
    const numberOfSliders = parseInt(this.customChange);

    this.sliderElements.forEach((sliderElement, index) => {
      if (index < numberOfSliders) {
        const style =
          this.sliderElements[index].currentStyle ||
          window.getComputedStyle(this.sliderElements[index]);
        const marginLeft = style.marginLeft;
        const marginRight = style.marginRight;
        const marginTop = style.marginTop;
        const marginBottom = style.marginBottom;
        if (this.animation === "horizontal") {
          this.customWidth +=
            sliderElement.offsetWidth +
            parseFloat(marginRight.substr(0, marginRight.length - 2)) +
            parseFloat(marginLeft.substr(0, marginLeft.length - 2));
        }
        if (this.animation === "vertical") {
          this.customWidth +=
            sliderElement.offsetHeight +
            parseFloat(marginBottom.substr(0, marginBottom.length - 2)) +
            parseFloat(marginTop.substr(0, marginTop.length - 2));
        }
      }
    });
  };

  //// odczytyje ilośc widocznych elementów ( bierze pod uwage margin)
  checkAmountOfElements = () => {
    if (this.animation === "fade") {
      this.amountOfVisibleElements = 1;
    }
    const style =
      this.sliderElements[0].currentStyle ||
      window.getComputedStyle(this.sliderElements[0]);
    let lastAmountOfVisibleElements;
    if (this.animation === "horizontal") {
      const marginLeft = style.marginLeft;
      const marginRight = style.marginRight;

      lastAmountOfVisibleElements =
        this.amountOfVisibleElements === null
          ? Math.round(
              this.widthOfVisibleElement /
                (this.sliderElements[0].offsetWidth +
                  parseFloat(marginRight.substr(0, marginRight.length - 2)) +
                  parseFloat(marginLeft.substr(0, marginLeft.length - 2)))
            )
          : this.amountOfVisibleElements;

      this.amountOfVisibleElements = Math.round(
        this.widthOfVisibleElement /
          (this.sliderElements[0].offsetWidth +
            parseFloat(marginRight.substr(0, marginRight.length - 2)) +
            parseFloat(marginLeft.substr(0, marginLeft.length - 2)))
      );

      this.shouldBeClear(lastAmountOfVisibleElements);
    }

    if (this.animation === "vertical") {
      this.slider.style.transform = "translateY(0)";
      const marginTop = style.marginTop;
      const marginBottom = style.marginBottom;

      lastAmountOfVisibleElements =
        this.amountOfVisibleElements === null
          ? Math.round(
              this.heightOfVisibleElement /
                (this.sliderElements[0].offsetHeight +
                  parseFloat(marginTop.substr(0, marginTop.length - 2)) +
                  parseFloat(marginBottom.substr(0, marginBottom.length - 2)))
            )
          : this.amountOfVisibleElements;

      this.amountOfVisibleElements = Math.round(
        this.heightOfVisibleElement /
          (this.sliderElements[0].offsetHeight +
            parseFloat(marginTop.substr(0, marginTop.length - 2)) +
            parseFloat(marginBottom.substr(0, marginBottom.length - 2)))
      );
      this.shouldBeClear(lastAmountOfVisibleElements);
    }
  };

  //// metoda zwracająca true/false przy sprawdzeniu czy kliknieta kropka jest ostatnia kropką
  isTheLast = (indexOfClickedDot) => {
    let flag;
    this.controlPanelElements.forEach((controlPanelElement) => {
      if (indexOfClickedDot === this.controlPanelElements.length - 1) {
        this.lastElementWasClicked = true;
        flag = true;
      }
    });
    return flag;
  };

  /// metida która łapie moment zmiany widocznych elementów i gdy to się stanie generuje na nowo navigacje
  shouldBeClear = (variable) => {
    if (variable !== this.amountOfVisibleElements) {
      this.controlPanel.innerHTML = "";
      this.createControlPanel(this.amountOfVisibleElements);
    }
  };

  /// metoda ustalająca która kropka jest aktywna i dopasowująca do niej slider ( pierwszy od lewej) z grupy odpowiadającej indexowi elementu nawigacji
  checkWhichDotNeedToBeActive = (way, index = null) => {
    if (way === "left") {
      const searchingDotWithIndex = parseInt(
        this.sliderElements[this.focus].dataset.group
      );
      if (!this.photoContainer) {
        this.addActiveForAnItem(
          this.controlPanelElements[searchingDotWithIndex]
        );
      }
      this.removeActiveForAnItems(this.sliderElements);
      this.addActiveForAnItem(this.sliderElements[this.focus]);
      if (this.photoContainer) {
        this.showPhoto();
      }

      return;
    }
    if (way === "dot") {
      this.sliderElements = this.slider.querySelectorAll(
        ".js__MainSlider-element"
      );
      const activeElement = this.slider.querySelector(
        `[data-group="${index}"]`
      );
      this.removeActiveForAnItems(this.sliderElements);
      this.addActiveForAnItem(
        this.sliderElements[parseInt(activeElement.dataset.index) + this.focus]
      );
      if (this.photoContainer) {
        this.showPhoto();
      }
    }
  };

  ////////// METODY TWORZACE/RESETUJACE ELEMENTY

  /// tworzy elementy HTML
  createElement = (item, classForItem, dataset = null, container) => {
    const element = document.createElement(item);

    element.classList.add(classForItem);
    if (dataset || dataset === 0) {
      element.dataset.index = dataset;
    }
    container.appendChild(element);
    return element;
  };
  /// tworzenie panelu z kropkami
  createControlPanel = (numberOfDots = null) => {
    let indexForDot = -1;
    this.sliderElements.forEach((sliderElement, index) => {
      if (numberOfDots && index % numberOfDots === 0) {
        indexForDot += 1;
        this.createElement(
          "div",
          "js__MainSlider-control-element",
          indexForDot,
          this.controlPanel
        ).addEventListener("click", (e) => {
          this.changeValueOfVariables();
          this.lastElementWasClicked = false;
          this.isTheLast(parseInt(e.target.dataset.index));
          this.indexManualyChanged = true;
          this.indexOfLastActiveDot = e.target.dataset.index;
          this.removeActiveForAnItems(this.sliderElements);
          this.removeActiveForAnItems(this.controlPanelElements);
          this.addActiveForAnItem(e.target);
          if (this.animation === "fade") {
            this.indexOfShowedSlider = parseInt(e.target.dataset.index);
            this.addActiveForAnItem(
              this.sliderElements[this.indexOfShowedSlider]
            );
            return;
          }

          if (!this.dotClicked) {
            this.findSlide();
            this.resetContainer();
            this.addTransition(false);
          } else {
            this.findSlide(this.indexOfLastActiveDot);
            this.addTransition(true);
          }
          if (this.lastElementWasClicked) {
            this.resetContainer();
            this.fillEmptySpace();
          }
          if (this.animation === "horizontal") {
            this.slider.style.transform = `translateX(-${this.customWidth}px)`;
          }
          if (this.animation === "vertical") {
            this.slider.style.transform = `translateY(-${this.customWidth}px)`;
          }
          this.dotClicked = true;
          setTimeout(() => {
            this.addTransition(true);
            this.findSlide(e.target.dataset.index);
            if (this.animation === "horizontal") {
              this.slider.style.transform = `translateX(-${this.customWidth}px)`;
            }
            if (this.animation === "vertical") {
              this.slider.style.transform = `translateY(-${this.customWidth}px)`;
            }
          }, 100);
          this.checkWhichDotNeedToBeActive(
            "dot",
            parseInt(e.target.dataset.index)
          );
        });
      }
    });
    this.controlPanelElements = this.controlPanel.querySelectorAll(
      ".js__MainSlider-control-element"
    );
  };

  findSlide = (dotIndex) => {
    this.sliderElements = this.slider.querySelectorAll(
      ".js__MainSlider-element"
    );
    let searchingSlide;
    if (dotIndex) {
      searchingSlide = this.slider.querySelector(`[data-group="${dotIndex}"]`);
    } else {
      searchingSlide = this.sliderElements[0];
    }

    this.customWidth = 0;
    if (this.animation === "horizontal") {
      this.sliderElements.forEach((sliderElement, index) => {
        if (index < parseInt(searchingSlide.dataset.index)) {
          const style =
            this.sliderElements[index].currentStyle ||
            window.getComputedStyle(this.sliderElements[index]);
          const marginLeft = style.marginLeft;
          const marginRight = style.marginRight;
          this.customWidth +=
            sliderElement.offsetWidth +
            parseFloat(marginRight.substr(0, marginRight.length - 2)) +
            parseFloat(marginLeft.substr(0, marginLeft.length - 2));
        }
      });
    }
    if (this.animation === "vertical") {
      this.sliderElements.forEach((sliderElement, index) => {
        if (index < parseInt(searchingSlide.dataset.index)) {
          const style =
            this.sliderElements[index].currentStyle ||
            window.getComputedStyle(this.sliderElements[index]);
          const marginTop = style.marginTop;
          const marginBottom = style.marginBottom;
          this.customWidth +=
            sliderElement.offsetHeight +
            parseFloat(marginTop.substr(0, marginTop.length - 2)) +
            parseFloat(marginBottom.substr(0, marginBottom.length - 2));
        }
      });
    }
  };
  /// resetuje caly container w ktorym sa slidy i nadaje je od nowa tak jak byly na poczatku
  resetContainer = () => {
    this.slider.innerHTML = "";
    this.startingSliderElements.forEach((sliderElement) => {
      this.slider.appendChild(sliderElement);
    });
  };

  ////// METODY DLA INDEXU

  /// zwiększenie indexu elementu navigacji + zmienna indexOfLastActiveDot
  increseDotIndex = () => {
    this.controlPanelElements.forEach((controlPanelElement, index) => {
      if (controlPanelElement.classList.contains("active")) {
        this.indexOfLastActiveDot = index + 1;
      }
    });
    this.controlPanelElements.forEach((controlPanelElement) => {
      controlPanelElement.classList.remove("active");
    });
    this.indexOfLastActiveDot =
      this.indexOfLastActiveDot > this.controlPanelElements.length - 1
        ? 0
        : this.indexOfLastActiveDot;
    this.indexOfLastActiveDot =
      this.indexOfLastActiveDot < 0
        ? this.controlPanelElements.length - 1
        : this.indexOfLastActiveDot;
    this.controlPanelElements[this.indexOfLastActiveDot].classList.add(
      "active"
    );
  };
  /// zmniejszenie indexu elementu nawigazji + zmienna indexOfLastActiveDot
  reduceDotIndex = () => {
    this.controlPanelElements.forEach((controlPanelElement, index) => {
      if (controlPanelElement.classList.contains("active")) {
        this.indexOfLastActiveDot = index - 1;
      }
    });
    this.controlPanelElements.forEach((controlPanelElement) => {
      controlPanelElement.classList.remove("active");
    });
    this.indexOfLastActiveDot =
      this.indexOfLastActiveDot > this.controlPanelElements.length - 1
        ? 0
        : this.indexOfLastActiveDot;
    this.indexOfLastActiveDot =
      this.indexOfLastActiveDot < 0
        ? this.controlPanelElements.length - 1
        : this.indexOfLastActiveDot;
    this.controlPanelElements[this.indexOfLastActiveDot].classList.add(
      "active"
    );
  };

  /// dla IndexOfShowedSlider => kontrola zmiennej
  repairIndex = () => {
    /////////////////////////////??????????????????????
    if (this.animation === "horizontal") {
      this.indexOfShowedSlider =
        this.indexOfShowedSlider > this.controlPanelElements.length - 1
          ? 0
          : this.indexOfShowedSlider;
      this.indexOfShowedSlider =
        this.indexOfShowedSlider < 0
          ? this.controlPanelElements.length - 1
          : this.indexOfShowedSlider;
    }
    this.indexOfShowedSlider =
      this.indexOfShowedSlider > this.sliderElements.length - 1
        ? 0
        : this.indexOfShowedSlider;
    this.indexOfShowedSlider =
      this.indexOfShowedSlider < 0
        ? this.sliderElements.length - 1
        : this.indexOfShowedSlider;
  };
  // zmniejsza index i zmienia slide ( dla fade)
  reduceIndex = () => {
    this.indexOfShowedSlider -= 1;
    this.changeSlide();
  };
  // zwieksza index i zmienia slide ( dla fade)
  increaseIndex = () => {
    this.indexOfShowedSlider += 1;
    this.changeSlide();
    this.increseDotIndex();
  };

  /// zmiana indexu kropki poprzez klikniecie w nia
  changeIndexByClickOnDot = (e) => {
    this.indexOfShowedSlider = parseInt(e.target.dataset.index);
  };
  ///////// INTERVAL

  /// interval
  setInterval = () => {
    this.intervalForSlider = setInterval(() => {
      if (this.animation === "fade") {
        this.increaseIndex();
      }
      if (this.animation === "horizontal" || this.animation === "vertical") {
        this.moveIntoNextSlide();

        this.removeActiveForAnItems(this.controlPanelElements);
      }
    }, this.intervalTime);
  };

  /////////// ZMETODY DO ZWYKLEJ ZMIANY SLIDE
  changeSlide = () => {
    this.repairIndex();
    this.sliderElements.forEach((sliderElement) => {
      sliderElement.classList.remove("active");
    });
    this.sliderElements[this.indexOfShowedSlider].classList.add("active");
  };

  moveIntoNextSlide = () => {
    if (this.dotClicked) {
      this.dotClicked = false;
      // this.slider.style.transform=`translateX(0px)`
      if (this.animation === "horizontal") {
        this.slider.style.transform = `translateX(0px)`;
      }
      if (this.animation === "vertical") {
        this.slider.style.transform = `translateY(0px)`;
      }
      this.checkItemsToAppend();

      if (this.lastElementWasClicked && this.numberOfItemsToAppend) {
        this.lastElementWasClicked = false;
        this.copyElementsForRight(
          this.indexOfActiveSlide,
          this.numberOfItemsToAppend
        );
        this.removeCloneElementsForRight(
          this.indexOfActiveSlide,
          this.numberOfItemsToAppend
        );
      } else {
        this.copyElementsForRight(this.indexOfActiveSlide);
        this.removeCloneElementsForRight(this.indexOfActiveSlide);
      }

      this.sliderElements = this.slider.querySelectorAll(
        ".js__MainSlider-element"
      );

      this.addTransition(false);

      setTimeout(() => {
        this.addTransition(true);
        if (this.animation === "horizontal") {
          this.checkWidth("left");
        }
        if (this.animation === "vertical") {
          this.checkHeight("left");
        }
        if (this.animation === "horizontal") {
          this.slider.style.transform = `translateX(-${this.customWidth}px)`;
        }
        if (this.animation === "vertical") {
          this.slider.style.transform = `translateY(-${this.customWidth}px)`;
        }
        this.copyElementsForRight();
      }, 100);
      setTimeout(() => {
        this.addTransition(false);
        this.removeCloneElementsForRight();
        if (this.animation === "horizontal") {
          this.slider.style.transform = `translateX(0px)`;
        }
        if (this.animation === "vertical") {
          this.slider.style.transform = `translateY(0px)`;
        }
        this.sliderElements = this.slider.querySelectorAll(
          ".js__MainSlider-element"
        );
        this.checkWhichDotNeedToBeActive("left");
      }, this.transition * 1000);
      return;
    }
    this.addTransition(true);
    if (this.animation === "horizontal") {
      this.checkWidth("left");
    }
    if (this.animation === "vertical") {
      this.checkHeight("left");
    }
    // this.slider.style.transform=`translateX(-${this.customWidth}px)`
    if (this.animation === "horizontal") {
      this.slider.style.transform = `translateX(-${this.customWidth}px)`;
    }
    if (this.animation === "vertical") {
      this.slider.style.transform = `translateY(-${this.customWidth}px)`;
    }
    this.copyElementsForRight();
    setTimeout(() => {
      this.addTransition(false);
      // this.slider.style.transform=`translateX(0px)`
      if (this.animation === "horizontal") {
        this.slider.style.transform = `translateX(0px)`;
      }
      if (this.animation === "vertical") {
        this.slider.style.transform = `translateY(0px)`;
      }
      this.removeCloneElementsForRight();
      this.sliderElements = this.slider.querySelectorAll(
        ".js__MainSlider-element"
      );
      this.checkWhichDotNeedToBeActive("left");
    }, this.transition * 1000);
  };
  checkWidth = (way) => {
    this.sliderElements = this.slider.querySelectorAll(
      ".js__MainSlider-element"
    );
    this.customWidth = 0;

    this.sliderElements.forEach((sliderElement, index) => {
      if (
        (index < this.customChange && way === "left") ||
        (way === "right" &&
          index > this.sliderElements.length - 1 - this.customChange)
      ) {
        const style =
          this.sliderElements[index].currentStyle ||
          window.getComputedStyle(this.sliderElements[index]);
        const marginLeft = style.marginLeft;
        const marginRight = style.marginRight;
        this.customWidth +=
          sliderElement.offsetWidth +
          parseFloat(marginRight.substr(0, marginRight.length - 2)) +
          parseFloat(marginLeft.substr(0, marginLeft.length - 2));
      }
    });
  };

  checkHeight = (way) => {
    this.sliderElements = this.slider.querySelectorAll(
      ".js__MainSlider-element"
    );
    this.customWidth = 0;

    this.sliderElements.forEach((sliderElement, index) => {
      if (
        (index < this.customChange && way === "left") ||
        (way === "right" &&
          index > this.sliderElements.length - 1 - this.customChange)
      ) {
        const style =
          this.sliderElements[index].currentStyle ||
          window.getComputedStyle(this.sliderElements[index]);
        const marginTop = style.marginTop;
        const marginBottom = style.marginBottom;
        this.customWidth +=
          sliderElement.offsetHeight +
          parseFloat(marginTop.substr(0, marginTop.length - 2)) +
          parseFloat(marginBottom.substr(0, marginBottom.length - 2));
      }
    });
  };

  copyElementsForRight = (activeIndex = null, itemsToNotCopy = null) => {
    if (activeIndex !== null) {
      this.sliderElements.forEach((sliderElement, index) => {
        if (index < activeIndex && index >= itemsToNotCopy) {
          this.elementsToCopy.push(sliderElement.cloneNode(true));
        }
      });
    } else {
      this.sliderElements.forEach((sliderElement, index) => {
        if (index < this.customChange) {
          sliderElement.dataset.listen = false;
          this.elementsToCopy.push(sliderElement.cloneNode(true));
        }
      });
    }
    this.elementsToCopy.forEach((elementToCopy) => {
      this.slider.appendChild(elementToCopy);
    });
    this.elementsToCopy = [];
  };

  removeCloneElementsForRight = (activeIndex = null, itemsToDelate = null) => {
    if (activeIndex !== null) {
      this.sliderElements.forEach((sliderElement, index) => {
        if (index < activeIndex) {
          this.slider.removeChild(sliderElement);
        }
      });
    } else {
      this.sliderElements.forEach((sliderElement, index) => {
        if (index < this.customChange) {
          this.slider.removeChild(sliderElement);
        }
      });
    }
  };
  checkItemsToAppend = () => {
    this.controlPanelElements.forEach((controlPanelElement, index) => {
      if (controlPanelElement.classList.contains("active")) {
        this.indexOfActiveSlide = index * this.amountOfVisibleElements;
      }
    });
  };

  showPhoto = () => {
    let activeSlide;

    this.sliderElements.forEach((sliderElement, index) => {
      if (sliderElement.classList.contains("active")) {
        activeSlide = sliderElement;
      }
    });
    const style =
      activeSlide.currentStyle || window.getComputedStyle(activeSlide);
    const imageUrl = style.backgroundImage;
    this.photoContainer.style.backgroundImage = imageUrl;
  };

  moveIntoPrevSlide = () => {
    if (this.dotClicked) {
      if (this.sliderElements[0].dataset.index == 0) {
        this.resetContainer();
      }
      this.dotClicked = false;
      this.checkItemsToAppend();
      if (this.lastElementWasClicked && this.numberOfItemsToAppend) {
        this.lastElementWasClicked = false;
        this.copyElementsForRight(
          this.indexOfActiveSlide,
          this.numberOfItemsToAppend
        );
        this.removeCloneElementsForRight(this.indexOfActiveSlide);
      } else {
        this.copyElementsForRight(this.indexOfActiveSlide);
        this.removeCloneElementsForRight(this.indexOfActiveSlide);
      }

      this.sliderElements = this.slider.querySelectorAll(
        ".js__MainSlider-element"
      );
      this.addTransition(false);
      this.slider.style.transform = `translateX(0px)`;
    }
    if (this.animation === "horizontal") {
      this.checkWidth("right");
    }
    if (this.animation === "vertical") {
      this.checkHeight("right");
    }
    this.copyElementsForLeft();
    this.addTransition(false);
    if (this.animation === "horizontal") {
      this.slider.style.transform = `translateX(-${this.customWidth}px)`;
    }
    if (this.animation === "vertical") {
      this.slider.style.transform = `translateY(-${this.customWidth}px)`;
    }
    // this.slider.style.transform=`translateX(-${this.customWidth}px)`
    setTimeout(() => {
      this.slider.style.transform = `translateX(0px)`;
      this.addTransition(true);
      this.removeCloneElementsForLeft();
      this.sliderElements = this.slider.querySelectorAll(
        ".js__MainSlider-element"
      );
      this.checkWhichDotNeedToBeActive("left");
    }, 100);
  };
  copyElementsForLeft = (activeIndex = null) => {
    if (activeIndex !== null) {
      this.sliderElements.forEach((sliderElement, index) => {
        if (index > this.sliderElements.length - 1 - this.customChange) {
          this.elementsToCopy.push(sliderElement.cloneNode(true));
        }
      });
    } else {
      this.sliderElements.forEach((sliderElement, index) => {
        if (index > this.sliderElements.length - 1 - this.customChange) {
          this.elementsToCopy.push(sliderElement.cloneNode(true));
        }
      });
    }
    this.elementsToCopy.reverse();
    this.elementsToCopy.forEach((elementToCopy) => {
      this.slider.prepend(elementToCopy);
    });
    this.elementsToCopy = [];
  };

  removeCloneElementsForLeft = () => {
    this.sliderElements.forEach((sliderElement, index) => {
      if (index > this.sliderElements.length - 1 - this.customChange) {
        this.slider.removeChild(sliderElement);
      }
    });
  };
  ////// METODY DLA NAWIGACJI

  /// metoda ktora po kliknieciu w kropke ostatnia wypelnia puste miejsce w sliderze
  fillEmptySpace = () => {
    this.spaceFilled = true;
    this.sliderElements = this.slider.querySelectorAll(
      ".js__MainSlider-element"
    );
    const itemsToAppend = [];
    this.numberOfItemsToAppend = 0;
    this.numberOfItemsToAppend =
      this.amountOfVisibleElements -
      (this.startingSliderElements.length % this.amountOfVisibleElements);

    for (let index = 0; index < this.numberOfItemsToAppend; index++) {
      itemsToAppend.push(this.sliderElements[index].cloneNode(true));
    }
    itemsToAppend.forEach((itemToAppend, index) => {
      this.slider.appendChild(itemToAppend);
    });
  };

  moveIntoSlideWithIndex = (index) => {
    if (index === this.controlPanelElements.length - 1) {
      this.addTransition(false);
      this.indexOfShowedSlider = index;
      if (this.animation === "horizontal") {
        this.slider.style.transform = `translateX(-${
          this.indexOfLastActiveDot * this.widthOfVisibleElement
        }px)`;
      }
      if (this.animation === "vertical") {
        this.slider.style.transform = `translateY(-${
          this.indexOfLastActiveDot * this.heightOfVisibleElement
        }px)`;
      }

      // this.slider.style.transform = `translateX(-${this.indexOfLastActiveDot*this.widthOfVisibleElement}px)`
      setTimeout(() => {
        this.addTransition(true);
        if (this.animation === "horizontal") {
          this.slider.style.transform = `translateX(-${
            index * this.widthOfVisibleElement
          }px)`;
        }
        if (this.animation === "vertical") {
          this.slider.style.transform = `translateY(-${
            index * this.heightOfVisibleElement
          }px)`;
        }
        // this.slider.style.transform = `translateX(-${index*this.widthOfVisibleElement}px)`
      }, 100);
      this.sliderElements = this.slider.querySelectorAll(
        ".js__MainSlider-element"
      );
      this.indexOfLastActiveDot = index;
      return;
    }
    if (this.indexOfLastActiveDot != this.controlPanelElements.length - 1) {
      this.resetContainer();
    }
    this.addTransition(false);
    this.indexOfShowedSlider = index;
    if (this.animation === "horizontal") {
      this.slider.style.transform = `translateX(-${
        this.indexOfLastActiveDot * this.widthOfVisibleElement
      }px)`;
    }
    if (this.animation === "vertical") {
      this.slider.style.transform = `translateY(-${
        this.indexOfLastActiveDot * this.heightOfVisibleElement
      }px)`;
    }
    // this.slider.style.transform = `translateX(-${this.indexOfLastActiveDot*this.widthOfVisibleElement}px)`
    setTimeout(() => {
      this.addTransition(true);
      if (this.animation === "horizontal") {
        this.slider.style.transform = `translateX(-${
          index * this.widthOfVisibleElement
        }px)`;
      }
      if (this.animation === "vertical") {
        this.slider.style.transform = `translateY(-${
          index * this.heightOfVisibleElement
        }px)`;
      }
      // this.slider.style.transform = `translateX(-${index*this.widthOfVisibleElement}px)`
    }, 100);
    this.sliderElements = this.slider.querySelectorAll(
      ".js__MainSlider-element"
    );
    this.indexOfLastActiveDot = index;
  };
  showPhotoByClickOnElement = () => {
    this.slider.addEventListener("click", (e) => {
      if (
        e.target.classList.contains("js__MainSlider-element") &&
        this.canIClick
      ) {
        this.canIClick = false;
        this.readyToClick();
        const allSlides = this.slider.querySelectorAll(
          ".js__MainSlider-element"
        );
        this.removeActiveForAnItems(allSlides);
        this.addActiveForAnItem(e.target);
        this.showPhoto();
        this.goIntoShowedPhoto(e.target);
      }
    });
  };

  goIntoShowedPhoto = (activeSlide) => {
    this.sliderElements.forEach((sliderElement, index) => {
      if (sliderElement === activeSlide) {
        if (this.focus === index) {
          return;
        }
        this.addTransition(true);
        const elementsToChange = this.focus - index;
        this.customSlide(elementsToChange);
      }
    });
  };

  customSlide = (elementsToChange) => {
    this.customWidth = 0;

    if (elementsToChange > 0) {
      this.sliderElements.forEach((sliderElement, index) => {
        if (index > this.sliderElements.length - 1 - elementsToChange) {
          const style =
            this.sliderElements[index].currentStyle ||
            window.getComputedStyle(this.sliderElements[index]);
          const marginLeft = style.marginLeft;
          const marginRight = style.marginRight;
          this.customWidth +=
            sliderElement.offsetWidth +
            parseFloat(marginRight.substr(0, marginRight.length - 2)) +
            parseFloat(marginLeft.substr(0, marginLeft.length - 2));
          this.elementsToCopy.push(sliderElement.cloneNode(true));
        }
      });

      this.elementsToCopy.reverse();
      this.elementsToCopy.forEach((elementToCopy) => {
        this.slider.prepend(elementToCopy);
      });
      this.elementsToCopy = [];
      this.addTransition(false);
      this.slider.style.transform = `translateX(-${this.customWidth}px)`;
      setTimeout(() => {
        this.addTransition(true);
        this.slider.style.transform = `translateX(${0}px)`;
        this.sliderElements.forEach((sliderElement, index) => {
          if (index > this.sliderElements.length - 1 - elementsToChange) {
            this.slider.removeChild(sliderElement);
          }
        });
        this.sliderElements = this.slider.querySelectorAll(
          ".js__MainSlider-element"
        );
      }, 100);
    }

    if (elementsToChange < 0) {
      this.sliderElements.forEach((sliderElement, index) => {
        if (index < elementsToChange * -1) {
          const style =
            this.sliderElements[index].currentStyle ||
            window.getComputedStyle(this.sliderElements[index]);
          const marginLeft = style.marginLeft;
          const marginRight = style.marginRight;
          this.customWidth +=
            sliderElement.offsetWidth +
            parseFloat(marginRight.substr(0, marginRight.length - 2)) +
            parseFloat(marginLeft.substr(0, marginLeft.length - 2));
          this.elementsToCopy.push(sliderElement.cloneNode(true));
        }
      });

      this.elementsToCopy.forEach((elementToCopy) => {
        this.slider.appendChild(elementToCopy);
      });
      this.elementsToCopy = [];
      this.slider.style.transform = `translateX(-${this.customWidth}px)`;
      this.addTransition(true);
      setTimeout(() => {
        this.addTransition(false);
        this.slider.style.transform = `translateX(${0}px)`;
        this.sliderElements.forEach((sliderElement, index) => {
          if (index < elementsToChange * -1) {
            this.slider.removeChild(sliderElement);
          }
        });
        this.sliderElements = this.slider.querySelectorAll(
          ".js__MainSlider-element"
        );
      }, this.transition * 1000);
    }
  };

  //// METODY NIWELUJACE POWTARZAJĄCY SIE KOD

  addActiveForAnItem = (item = null) => {
    if (!item) {
      return;
    }
    item.classList.add("active");
  };
  removeActiveForAnItems = (groupOfItems = null) => {
    if (!groupOfItems) {
      return;
    }
    groupOfItems.forEach((item) => {
      item.classList.remove("active");
    });
  };
}

/// KLASY

/// js__MainSlider => na slider ale nie ma container
/// js__MainSlider-arrow--left => strzalka w lewo
/// js__MainSlider-arrow--right => strzałka w prawo
/// js__MainSlider-controler => dla kontenera na kropki
/// js__MainSlider-element => dla każdego slida
/// js__MainSlider-control-element => dla kazdej kropki I TO STYLOWAC
/// js__MainSlider-hidden => na strzalki pojedyncze LUB/I na kontener z kropkami czy maja byc schowane jak nie ma na nich myszki
/// js__MainSlider-photo => tu bedzie wyswietlane zdjecie DODAC MU ID TAKIE JAKA MA KLASE CONTAINER

/// daty

///data-interval="milisekundy" => dla js__MainSlider czas co ile ma się zmieniać slide
/// data-mobile=true => dla js__MainSlider rozpoznawanie touches

/// data-animate="fade" => dla js__MainSlider  jak maja slidy sie przenikac przez siebie
/// data-animate="horizontal" => dla js__MainSlider  jak slider jest lewo prawo
/// data-changeSlide=1 => ruch slidu o 1 element PISAC ZAWSZE

/// data-focus="2" -> ktory z widocznych slidow ma dostawac active (index)
/// horizontal NIE MOZE BYC NTH CHILD STYLOWANE BO BEDA SIE ZMIENIAC CHILDY
