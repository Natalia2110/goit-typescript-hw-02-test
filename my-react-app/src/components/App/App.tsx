import { useState, useEffect } from "react";
import css from "./App.module.css";
import SearchBar from "../SearchBar/SearchBar.js";
import ImageGallery from "../ImageGallery/ImageGallery.js";
import Loader from "../Loader/Loader.js";
import ErrorMessage from "../ErrorMessage/ErrorMessage.js";
import LoadMoreBtn from "../LoadMoreBtn/LoadMoreBtn.js";
import ImageModal from "../ImageModal/ImageModal.js";
import { Toaster } from "react-hot-toast";
import requestImg from "../services/api.js";
import { Image, Response } from "./App.types.js";

function App() {
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [modalImage, setModalImage] = useState<Image | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showBtn, setShowBtn] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [error, setError] = useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const handleSearch = (value: string): void => {
    // console.log(value);
    if (value !== null) {
      setImages([]);
      setPage(1);
      setSearchValue(value);
    }
  };

  const handleClickLoadMoreBtn = (): void => {
    const nextPage: number = page + 1;
    setPage(nextPage);
  };

  const showLoadMoreButton = (allPages: number) => {
    if (allPages !== page) {
      return setShowBtn(true);
    }
    return setShowBtn(false);
  };

  const handleOpenModal = (data: Image): void => {
    // console.log(data);
    setIsOpenModal(true);
    setModalImage(data);
  };

  const handleCloseModal = (): void => {
    setIsOpenModal(false);
  };

  useEffect(() => {
    if (searchValue === null) {
      return;
    } else {
      const fetchImgBySearchValue = async (): Promise<void> => {
        try {
          setError(false);
          setIsLoading(true);

          const data: Response = await requestImg(searchValue, page);
          // console.log(data);
          if (data.results.length === 0) {
            setImages([]);
            setError(true);
          } else {
            const addNewPageImg = [...images, ...data.results];
            setImages(addNewPageImg);
            showLoadMoreButton(data.total_pages);
          }
        } catch {
          setImages([]);
          setError(true);
        } finally {
          setIsLoading(false);
        }
      };
      fetchImgBySearchValue();
    }
  }, [searchValue, page]);

  useEffect(() => {
    if (isOpenModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "scroll";
    }
  }, [isOpenModal]);

  return (
    <div className={css.container}>
      <SearchBar onSubmit={handleSearch} />
      {searchValue === "" && <Toaster />}

      {Array.isArray(images) && images.length !== 0 && (
        <ImageGallery images={images} onClick={handleOpenModal} />
      )}
      {isOpenModal && modalImage !== null && (
        <ImageModal
          isOpen={isOpenModal}
          onModalImg={modalImage}
          onCloseModal={handleCloseModal}
        />
      )}

      {error !== false && searchValue !== null && (
        <ErrorMessage onError={searchValue} />
      )}

      {isLoading && <Loader />}
      {showBtn && images.length > 0 && (
        <LoadMoreBtn onClickBtn={handleClickLoadMoreBtn} />
      )}
    </div>
  );
}

export default App;
