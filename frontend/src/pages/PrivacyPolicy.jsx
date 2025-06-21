import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Helmet } from 'react-helmet-async'
const PrivacyPolicy = () => {
  return (
    <>
    <Helmet>
      <title>ТАЙМБУК - политика конфиденциальности</title>
    </Helmet>
      <Header />
      <section className='grid grid-cols-1 md:grid-cols-3'>
        <div className='px-7 md:p-20 space-y-5 md:col-span-2 py-20'>
          <h1 className='text-xl md:text-3xl zag text-center' id="top">Политика конфиденциальности онлайн дневника ТАЙМБУК</h1>

          <h2 className='text-xl zag' id="general">1. Общие положения</h2>
          <p className='text-base text px-5'>
            Настоящая политика конфиденциальности (далее — Политика) определяет порядок обработки и защиты персональных данных пользователей, которые могут быть получены сервисом онлайн дневника ТАЙМБУК (далее — Сервис) при использовании сайта, мобильного приложения и других сервисов, связанных с ТАЙМБУК.
          </p>
          <p className='text-base text px-5'>
            Использование Сервиса означает безоговорочное согласие пользователя с данной Политикой и указанными в ней условиями обработки информации. Если пользователь не согласен с этими условиями, он должен воздержаться от использования Сервиса.
          </p>

          <h2 className='text-xl zag' id="personal">2. Персональные данные пользователей</h2>
          <h3 className='text-lg zag' id="personal-types">2.1. Виды собираемых данных</h3>
          <ul className='text-base text px-10 list-disc'>
            <li>Имя, фамилия, псевдоним пользователя</li>
            <li>Адрес электронной почты</li>
            <li>Номер телефона (по желанию пользователя)</li>
            <li>Данные, предоставляемые при регистрации и заполнении профиля</li>
            <li>IP-адрес, данные о браузере и устройстве</li>
            <li>История действий в Сервисе</li>
          </ul>
          <h3 className='text-lg zag' id="personal-ways">2.2. Способы сбора данных</h3>
          <ul className='text-base text px-10 list-disc'>
            <li>Путём заполнения форм на сайте или в приложении</li>
            <li>Автоматически при использовании Сервиса (cookie, логи, аналитика)</li>
            <li>Через обратную связь и обращения в поддержку</li>
          </ul>

          <h2 className='text-xl zag' id="purpose">3. Цели обработки персональных данных</h2>
          <ul className='text-base text px-10 list-disc'>
            <li>Обеспечение функционирования Сервиса и предоставление персонализированных функций</li>
            <li>Идентификация пользователя</li>
            <li>Связь с пользователем, включая отправку уведомлений и ответов на запросы</li>
            <li>Улучшение качества работы Сервиса и разработка новых функций</li>
            <li>Проведение статистических и иных исследований на основе обезличенных данных</li>
            <li>Соблюдение требований законодательства</li>
          </ul>

          <h2 className='text-xl zag' id="transfer">4. Условия обработки и передачи данных</h2>
          <h3 className='text-lg zag' id="transfer-storage">4.1. Хранение и защита данных</h3>
          <ul className='text-base text px-10 list-disc'>
            <li>Обработка и хранение персональных данных осуществляется в соответствии с требованиями законодательства РФ.</li>
            <li>Данные хранятся на защищённых серверах, доступ к которым ограничен.</li>
            <li>Используются современные методы защиты информации от несанкционированного доступа, изменения, раскрытия или уничтожения.</li>
          </ul>
          <h3 className='text-lg zag' id="transfer-third">4.2. Передача третьим лицам</h3>
          <ul className='text-base text px-10 list-disc'>
            <li>Данные пользователя не передаются третьим лицам, за исключением случаев, предусмотренных законом или с согласия пользователя.</li>
            <li>В отдельных случаях данные могут быть переданы по запросу государственных органов, если это требуется по закону.</li>
          </ul>

          <h2 className='text-xl zag' id="rights">5. Права пользователя</h2>
          <ul className='text-base text px-10 list-disc'>
            <li>Пользователь вправе в любой момент изменить или удалить свои персональные данные в настройках аккаунта.</li>
            <li>Пользователь может отозвать согласие на обработку персональных данных, направив соответствующее уведомление на электронную почту службы поддержки Сервиса.</li>
            <li>Пользователь имеет право запросить информацию о своих данных и способах их обработки.</li>
            <li>Пользователь может ограничить или запретить обработку своих данных, за исключением случаев, предусмотренных законом.</li>
          </ul>

          <h2 className='text-xl zag' id="cookies">6. Использование файлов cookie и обезличенных данных</h2>
          <h3 className='text-lg zag' id="cookies-what">6.1. Что такое cookie</h3>
          <p className='text-base text px-5'>
            Cookie — это небольшие текстовые файлы, которые сохраняются на устройстве пользователя для обеспечения корректной работы сайта, а также для анализа поведения пользователей и улучшения качества предоставляемых услуг.
          </p>
          <h3 className='text-lg zag' id="cookies-purpose">6.2. Для чего используются cookie</h3>
          <ul className='text-base text px-10 list-disc'>
            <li>Аутентификация пользователя</li>
            <li>Сохранение пользовательских настроек</li>
            <li>Аналитика посещаемости и поведения на сайте</li>
            <li>Проведение маркетинговых и рекламных кампаний</li>
          </ul>
          <h3 className='text-lg zag' id="cookies-manage">6.3. Управление cookie</h3>
          <p className='text-base text px-5'>
            Пользователь может самостоятельно изменить настройки использования cookie в своём браузере, а также удалить сохранённые cookie-файлы. Отключение cookie может повлиять на работоспособность некоторых функций Сервиса.
          </p>

          <h2 className='text-xl zag' id="changes">7. Изменения в политике конфиденциальности</h2>
          <p className='text-base text px-5'>
            Сервис оставляет за собой право вносить изменения в настоящую Политику. Актуальная версия всегда доступна на сайте. Рекомендуем периодически проверять данную страницу.
          </p>

          <h2 className='text-xl zag' id="contacts">8. Контактная информация</h2>
          <p className='text-base text px-5'>
            По вопросам, связанным с обработкой персональных данных и настоящей Политикой, вы можете обратиться по адресу электронной почты: <a href="mailto:support@timebook.ru" className="text-blue-600 underline">support@timebook.ru</a>
          </p>
        </div>
        <div className='hidden md:block md:pt-20'>
          <nav className="card fixed md:p-20 rounded-lg">
            <ul className="space-y-2 text-lg">
              <li><a href="#general">1. Общие положения</a></li>
              <li><a href="#personal">2. Персональные данные</a>
                <ul className="ml-4 text-sm space-y-1">
                  <li><a href="#personal-types">2.1. Виды данных</a></li>
                  <li><a href="#personal-ways">2.2. Способы сбора</a></li>
                </ul>
              </li>
              <li><a href="#purpose">3. Цели обработки</a></li>
              <li><a href="#transfer">4. Обработка и передача</a>
                <ul className="ml-4 text-sm space-y-1">
                  <li><a href="#transfer-storage">4.1. Хранение и защита</a></li>
                  <li><a href="#transfer-third">4.2. Передача третьим лицам</a></li>
                </ul>
              </li>
              <li><a href="#rights">5. Права пользователя</a></li>
              <li><a href="#cookies">6. Cookie и обезличенные данные</a>
                <ul className="ml-4 text-sm space-y-1">
                  <li><a href="#cookies-what">6.1. Что такое cookie</a></li>
                  <li><a href="#cookies-purpose">6.2. Для чего используются</a></li>
                  <li><a href="#cookies-manage">6.3. Управление cookie</a></li>
                </ul>
              </li>
              <li><a href="#changes">7. Изменения политики</a></li>
              <li><a href="#contacts">8. Контакты</a></li>
              <li><a href="#top" className="text-blue-400 hover:underline text-sm">Наверх</a></li>
            </ul>
          </nav>
        </div>
      </section>
      <Footer />
    </>
  )
}

export default PrivacyPolicy